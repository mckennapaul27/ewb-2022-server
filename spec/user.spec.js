let chai = require('chai')
let { expect } = require('chai')
let chaiHttp = require('chai-http');
let should = chai.should()


const C = require('chance');
const chance = new C();

const app = require('../server');
const { seedDatabase } = require('../seed/seed')
const User = require('../models/common/User');

chai.use(chaiHttp);

describe('API endpoints', () => {
    // before(done => {
    //    seedDatabase(done)
    // });

    // /common/user endpoints
    describe('/user endpoints', () => {
        describe('GET /common/user/get-user', () => {
            it('should return the user by accessing req.user from jwt token', (done) => {            
                createNewUser()
                .then(result => {
                    chai.request(app)
                    .get('/common/user/get-user')
                    .set({ ['Authorization']: result.body.token })                
                    .end((err, res) => {
                        if (err) console.log(err)
                        else {     
                            res.should.have.status(200);
                            expect(res.body).to.be.a('object')
                            expect(res.body.name).to.be.a('string')
                            expect(res.body).to.not.have.property('password')                       
                        }
                        done()
                    })
                }).catch(e => done(e))
            })
        })
    })





})


function createNewUser (storedPassword) {
    let user = {
        name: chance.name(),
        email: chance.email(),
        password: storedPassword ? storedPassword : chance.word()
    }
    return chai.request(app)
    .post('/common/auth/create-new-user')
    .send(user)
    .then(res => res)
    .catch(e => console.log(e))
}


