let chai = require('chai')
let { expect } = require('chai')
let chaiHttp = require('chai-http');
let should = chai.should();

const C = require('chance');
const chance = new C();
const sinon = require('sinon')
const ms = require('ms');
const app = require('../server');
const { seedDatabase } = require('../seed/seed')
const {
    User,
    Notification
} = require('../models/common/index');
let clock;

chai.use(chaiHttp);

describe('API endpoints', () => {
    before(done => {
       seedDatabase(done)
    });
    beforeEach(done => {
        clock = sinon.useFakeTimers();
        done();
    })
    afterEach(done => {
        clock.restore();
        done();
    })
    // /auth endpoints
    describe('/auth endpoints', () => {
        describe('POST /auth/create-new-user', () => {
            it('Should correctly save the user', (done) => {
                let user = {
                    name: chance.name(),
                    email: chance.email(),
                    password: chance.word()
                }
                chai.request(app) 
                    .post(`/auth/create-new-user`)                        
                    .send(user)  
                    .end(async (err, res) => {
                        if (err) console.log(err);
                        res.should.have.status(201);
                        expect(res.body).to.have.property('token');
                        res.body.token.should.be.a('string');
                        res.body.user.name.should.be.a('string');
                        res.body.user.email.should.be.a('string');                
                    done()    
                })
            });
            it('should return the next userId in the sequence and save it', (done) => {
                let user = {
                    name: chance.name(),
                    email: chance.email(),
                    password: chance.word()
                }
                chai.request(app) 
                    .post(`/auth/create-new-user`)                        
                    .send(user)  
                    .end(async (err, res) => {
                        if (err) console.log(err);
                        const uniqueUsers = await User.countDocuments({ userId: res.body.user.userId });
                        expect(uniqueUsers).to.eql(1)
                    done()    
                })
            })
            it('Should return error if fields are missing', (done) => {
                let user = {
                    // excluded name from User
                    email: chance.email(),
                    password: chance.word()
                }
                chai.request(app) 
                    .post(`/auth/create-new-user`)                        
                    .send(user)  
                    .end((err, res) => {
                        if (err) console.log(err);
                        else res.should.have.status(500);                               
                    done()    
                })
            });            
        });
    
        describe('POST /auth/user-login', () => {
            it('should successfully log user in and return jwt token and not return the password', (done) => {
                let passwordText = chance.word();
                createNewUser(passwordText)
                .then(result => {
                    let userToLogin = {
                        email: result.body.user.email,
                        password: passwordText
                    }
                    chai.request(app)
                    .post('/auth/user-login')
                    .send(userToLogin)
                    .end((err, res) => {
                        if (err) console.log(err)
                        else {
                            res.should.have.status(200);
                            expect(res.body).to.have.property('token');
                            expect(res.body.user).to.not.have.property('password');
                            res.body.token.should.be.a('string');
                            res.body.user.name.should.be.a('string');
                            res.body.user.email.should.be.a('string');
                        }
                        done()
                    })
                }).catch(e => done(e))
            })
            it('should fail login if password is incorrect', (done) => {
                createNewUser()
                .then(result => {
                    let userToLogin = {
                        email: result.body.user.email,
                        password: chance.word()
                    }
                    chai.request(app)
                    .post('/auth/user-login')
                    .send(userToLogin)
                    .end((err, res) => {
                        if (err) console.log(err)
                        else {
                            res.should.have.status(401);
                            expect(res.body.msg).to.eql('Authentication failed. Incorrect password')
                        }
                        done()
                    })
                }).catch(e => done(e))
            })
        })
        describe('GET /auth/client-ids', () => {
            it('should return google and facebook client ID and google ReCAPTCHA ID', (done) => {
                chai.request(app)
                .get('/auth/client-ids')
                .end((err, res) => {
                    if (err) console.log(err);
                    else {
                        expect(res.body.RECAPTCHA_KEY).to.be.a('string');
                        expect(res.body.GOOGLE_CLIENT_ID).to.be.a('string');
                        expect(res.body.FB_APP_ID).to.be.a('string');
                    }
                    done();
                })
            })
        })
        describe('POST /auth/forgot-password', () => {
            it('should set resetPasswordToken for user when requested', (done) => {
                createNewUser()
                .then(result => {
                    chai.request(app)
                    .post('/auth/forgot-password')
                    .send({ email: result.body.user.email })
                    .end((err, res) => {
                        if (err) console.log(err);
                        User.findById(res.body._id)
                        .then(user => {
                            res.should.have.status(201);
                            expect(user).to.have.property('resetPasswordToken');
                            expect(user.resetPasswordToken).to.be.a('string');
                            expect(user.resetPasswordExpires).to.be.a('date')
                            expect(res.body.msg).to.eql('Kindly check your email for further instructions')
                            done()
                        }).catch(e => done(e))
                    })
                }).catch(e => done(e))
            })
        });
        describe('POST /auth/reset-password', () => {
            it('should find the user from the resetPasswordToken', (done) => {
                createNewUser()
                .then(result => {
                    chai.request(app)
                    .post('/auth/forgot-password')
                    .send({ email: result.body.user.email })
                    .then(res => {                        
                        chai.request(app)
                        .post('/auth/reset-password')
                        .send({ token: res.body.token, password: 'abcdef' })
                        .end((err, res) => {
                            if (err) console.log(err);
                            res.should.have.status(201)
                            expect(res.body.msg).to.eql('Password successfully reset. Please login')
                            expect(res.body.user.email).to.eql(result.body.user.email)
                            expect(res.body.user.resetPasswordExpires).to.eql(null)
                            expect(res.body.user.resetPasswordToken).to.eql(null)
                            done()
                        })
                    });
                }).catch(e => done(e))
            })
        })
        // describe('/GET /')
    })
})


function createNewUser (storedPassword) {
    let user = {
        name: chance.name(),
        email: chance.email(),
        password: storedPassword ? storedPassword : chance.word()
    }
    return chai.request(app)
    .post('/auth/create-new-user')
    .send(user)
    .then(res => res)
    .catch(e => console.log(e))
}


