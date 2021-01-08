
const request = require('superagent');
require('superagent-proxy')(request);


const {
    AffAccount,
    AffReport,
    AffApplication,
    AffPartner
} = require('./models/affiliate/index');





const dataTransfer = async () => {
    await fetchUsersFrom5000();
}

const fetchUsersFrom5000 = async () => {
    // try {
    //     const res = await request.get('http://localhost:5000/data/get-users');
    //     console.log(res.body);
    //     return new Promise(resolve => (resolve (res)))
    // } catch (error) {
    //     console.log(error);
    // }
};

fetchUsersFrom5000();


module.exports = {
    dataTransfer
}