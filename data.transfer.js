const mongoose = require('mongoose');
const request = require('superagent');
require('superagent-proxy')(request);

const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat); // https://day.js.org/docs/en/plugin/localized-format


const {
    AffAccount,
    AffReport,
    AffApplication,
    AffPartner,
    AffCounter
} = require('./models/affiliate/index');

const { User, UserCounter } = require('./models/common/index');

const { ActiveUser } = require('./models/personal/index');

const {

} = require('./models/admin/index');
const { setCurrency } = require('./config/deals');

// mongoose.Types.ObjectId(_id);

const dataTransfer = async () => {
    await UserCounter.deleteMany();
    await AffCounter.deleteMany();
    await User.deleteMany();
    await ActiveUser.deleteMany();
    await AffPartner.deleteMany();
    await AffAccount.deleteMany();
    await AffReport.deleteMany();

    await setInitialUserData();
    await setInitialPartnerData();
    await setUserCounter(); // Only call when first transferring data
    await setAffCounter(); // Only call when first transferring data - Have to call this before updateInitialUserData() otherwise we will not have AffCounter
    await updateInitialUserData(); // fetch data by user _id and then map to activeuser
    await setInitialAffAccountData();
    // await setInitialAffReportData();
    console.log('done!!!!!!!!!');
};



const setInitialUserData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                let newName;
                let newEmail;
                let newPassword;
                let newUserId;
                let newRegDate;
                let newFacebookProvider;
                let newGoogleProvider;

                try {
                    const users = (await request.get('http://localhost:5000/data/get-users')).body;

                    await users.reduce(async (previousUser, nextUser) => {
                        await previousUser;
                        const {
                            _id,
                            firstName,
                            lastName,
                            email,
                            password,
                            timestamp,
                            facebookProvider,
                            googleProvider,
                            partner,
                            isPartner,
                            referredBy,
                            userId,
                            raf
                        } = nextUser;


                        const existing = await User.findById(_id);
                        if (existing) return new Promise(resolve => resolve(nextUser));
                        else {
                            newId = mongoose.Types.ObjectId(_id);
                            newName = `${firstName} ${(lastName === 'Not Provided' || lastName === 'Not provided') ? '' : lastName}`;
                            newEmail = email;
                            newPassword = password;
                            newUserId = userId;
                            newRegDate = Number(dayjs(timestamp).format('x'));
                            newPartner = partner;
                            newFacebookProvider = facebookProvider;
                            newGoogleProvider = googleProvider;
    
                            const newUser = new User({
                                _id: newId,
                                name: newName, 
                                email: newEmail,
                                password: newPassword,
                                userId: newUserId,
                                regDate: newRegDate
                            });
    
                            if (newFacebookProvider) newUser.facebookProvider = newFacebookProvider;
                            if (newGoogleProvider) newUser.googleProvider = newGoogleProvider;
    
                            if (partner) { // if partner was partner on old database set user.partner to partner
                                newUser.partner = mongoose.Types.ObjectId(partner);
                                const p = (await request.get(`http://localhost:5000/data/get-partner-by-id/${partner}`)).body;
                                if (p.referredByPartner) { 
                                    newUser.referredByPartner = mongoose.Types.ObjectId(p.referredByPartner);
                                };            
                            };
                            if (referredBy) {
                                try {
                                    const referredByUser = (await request.get(`http://localhost:5000/data/get-user-by-id/${referredBy}`)).body;
                                    newUser.referredBy = referredByUser.userId;
                                } catch (error) {
                                    console.log(error);
                                }
                            };
    
                            const newActiveUser = await ActiveUser.create({ belongsTo: newId, email: newEmail }); // create Activeuser
    
                            if (raf.commission > 0) { // if old raf balance from old database - add this to balance - may have to reset it tho
                                const oldRafbalance = raf.commission - raf.paid;
                                await ActiveUser.findByIdAndUpdate(newActiveUser._id, { // might need to adjust this when we later set balances using reports etc
                                    'stats.balance.$[el].amount': oldRafbalance,
                                    'stats.raf.$[el].amount': raf.commission
                                }, {
                                    new: true,
                                    arrayFilters: [{ 'el.currency': 'USD' }],
                                    select: 'stats'
                                });
                            }
    
                            newUser.activeUser = newActiveUser._id; // save activeuser to User
    
                            await User.create(newUser);
    
                            return new Promise(resolve => resolve(nextUser));
                        }
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialPartnerData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const partners = (await request.get('http://localhost:5000/data/get-partners')).body;
                    await partners.reduce(async (previousPartner, nextPartner) => {
                        await previousPartner;
                        const { // [1] old fields
                            _id,
                            email,
                            paymentDetails,
                            dealTier,
                            revShareActive,
                            fixedDealActive,
                            ecoPayz,
                            epi,
                            accounts,
                            belongsTo,
                            subPartnerCode,
                            subPartnerRate,
                            isSubPartner,
                            isOfficialPartner,
                            subPartners,
                            referredByPartner
                        } = nextPartner;

                        const existing = await AffPartner.findById(_id).select('_id')
                        if (existing) return new Promise(resolve => resolve(nextPartner));
                        else {
                            const newPartner = new AffPartner({
                                _id: mongoose.Types.ObjectId(_id),
                                email,
                                epi,
                                belongsTo: mongoose.Types.ObjectId(belongsTo),
                                subPartnerRate,
                                revShareActive,
                                isSubPartner,
                                isOfficialPartner,
                                subPartners,
                                accounts
                            });
                            if (subPartnerCode) newPartner.subPartnerCode = subPartnerCode;
                            if (referredByPartner) newPartner.referredBy = referredByPartner;    
                            if (paymentDetails && paymentDetails.USD.brand !== '') newPartner.paymentDetails.push({
                                currency: 'USD',
                                brand: paymentDetails.USD.brand,
                                email: paymentDetails.USD.email,
                            });

                            const dealReturner = (brand) => dealTier[brand].reduce((acc, item) => {
                                acc.rates.push({
                                    level: item.level,
                                    minVol: item.minVol,
                                    maxVol: item.maxVol,
                                    cashback: item.cashback
                                })
                                return acc;
                            }, {
                                brand: brand,
                                rates: []
                            });
                           
                            newPartner.deals.push(dealReturner('Neteller'));
                            newPartner.deals.push(dealReturner('Skrill'));
                            newPartner.deals.push(dealReturner('ecoPayz'));
    
                            if (ecoPayz.link !== '') newPartner.brandAssets.push({
                                brand: 'ecoPayz',
                                link: ecoPayz.link
                            })
                            if (fixedDealActive) newPartner.fixedDealActive = {
                                isActive: true,
                                rate: 0.35
                            };
                            await AffPartner.create(newPartner);
    
                            return new Promise(resolve => resolve(nextPartner));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const updateInitialUserData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                
                try {
                    const users = (await request.get('http://localhost:5000/data/get-users')).body;
                    await users.reduce(async (previousUser, nextUser) => {
                        await previousUser;
                        const {
                            _id,
                            email,
                            isPartner,
                            referredBy,
                            partner
                        } = nextUser;

                        if (referredBy) {
                            const foundUser = await User.findById(_id); // find user in new database
                            const refUser = await User.findOne({ userId: foundUser.referredBy }); // find referrer user in new database by checking userId

                            await User.findByIdAndUpdate(foundUser._id, { // update referredByActiveUser to refUser.activeUser
                                referredByActiveUser: mongoose.Types.ObjectId(refUser.activeUser)
                            });
                           
                            const updatedActiveUser = await ActiveUser.findByIdAndUpdate(foundUser.activeUser, { // updated referredBy of activeuse (ref: 'activeuser')
                                referredBy: mongoose.Types.ObjectId(refUser.activeUser)
                            }, { new: true });

                            await ActiveUser.findByIdAndUpdate(refUser.activeUser, { // push referee activeuser into friends array of referrer
                                $push: { 
                                    friends: updatedActiveUser._id
                                } 
                            }, { new: true })
                        };

                        if (!partner) {
                            const newPartner = await AffPartner.create({ belongsTo: mongoose.Types.ObjectId(_id), email });
                            await User.findByIdAndUpdate(_id, {
                                partner: newPartner
                            }, { new: true, select: 'partner' })
                        }

                        return new Promise(resolve => resolve(nextUser));
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialAffAccountData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const accounts = (await request.get('http://localhost:5000/data/get-aff-accounts')).body;
                    
                    await accounts.reduce(async (previousAccount, nextAccount) => {
                        await previousAccount;
                        const { // [1] old fields
                            _id,
                            brand,
                            account,
                            dateAdded,
                            // reports,
                            belongsTo
                        } = nextAccount;
                        
                        const existing = await AffAccount.findById(_id);
                        if (existing) return new Promise(resolve => resolve(nextAccount));
                        else {
                            const newAccount = new AffAccount({
                                _id,
                                brand,
                                accountId: account.accountId,
                                dateAdded: Number(dayjs(dateAdded).format('x')),
                                // reports,
                                belongsTo
                            });

                            await AffAccount.create(newAccount);
                            
                            return new Promise(resolve => resolve(nextAccount));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialAffReportData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const reports = (await request.get('http://localhost:5000/data/get-aff-reports')).body;
                    
                    await reports.reduce(async (previousReport, nextReport) => {
                        await previousReport;
                        const { // [1] old fields
                            _id,
                            brand,
                            date,
                            month,
                            lastUpdate,
                            account: {
                                accountId,  
                                transValue,
                                commission,
                                cashback,
                                cashbackRate,
                                subAffCommission,
                                earnedFee
                            },
                            belongsTo,
                            belongsToPartner
                        } = nextReport;
                        
                        const existing = await AffReport.findById(_id);
                        if (existing) return new Promise(resolve => resolve(nextReport));
                        else {
                            const newReport = new AffReport({
                                _id,
                                brand,
                                date: Number(dayjs(date).format('x')),
                                month,
                                lastUpdate: Number(dayjs(lastUpdate).format('x')), 
                                'account.accountId': accountId,  
                                'account.deposits': 0,
                                'account.transValue': transValue,
                                'account.commission': commission,
                                'account.cashback': cashback,
                                'account.commissionRate': commission === 0 ? 0 : commission / transValue,
                                'account.cashbackRate': cashback === 0 ? 0 : cashback / transValue,
                                'account.subAffCommission': subAffCommission,
                                'account.earnedFee': earnedFee,
                                'account.profit': commission === 0 ? 0 : commission - (cashback + subAffCommission),   
                                'account.currency': setCurrency(brand),                             
                                belongsTo,
                                belongsToPartner
                            });

                            const updatedReport = await AffReport.create(newReport);

                            console.log(updatedReport);

                            await AffAccount.findByIdAndUpdate(newReport.belongsTo, {
                                $push: {
                                    accounts: updatedReport
                                }
                            }, { new: true, select: 'accounts' });
                            
                            return new Promise(resolve => resolve(nextReport));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialAffApplicationData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const accounts = (await request.get('http://localhost:5000/data/get-aff-accounts')).body;
                    
                    await accounts.reduce(async (previousAccount, nextAccount) => {
                        await previousAccount;
                        const { // [1] old fields
                            _id,
                            brand,
                            account,
                            dateAdded,
                            reports,
                            belongsTo
                        } = nextAccount;
                        
                        const existing = await AffAccount.findById(_id);
                        if (existing) return new Promise(resolve => resolve(nextAccount));
                        else {
                            const newAccount = new AffAccount({
                                _id,
                                brand,
                                accountId: account.accountId,
                                dateAdded: Number(dayjs(dateAdded).format('x')),
                                reports,
                                belongsTo
                            });

                            await AffAccount.create(newAccount);
                            
                            return new Promise(resolve => resolve(nextAccount));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

// create new AffPartner
const createAffPartner = async ({ belongsTo, email }) => {
    const newAffPartner = await AffPartner.create({ belongsTo, email });
    return new Promise(resolve => (resolve (newAffPartner)))
};

const setUserCounter = () => {
    return new Promise(resolve => {
        resolve (
            (async() => {
                const users = await User.find({}).select('userId').sort({ userId: 'desc' });
                UserCounter.create({ _id: 'userid', seq: users[0].userId })
            })()
        )
    })
};

const setAffCounter = () => {
    return new Promise(resolve => {
        resolve (
            (async() => {
                const partners = await AffPartner.find({}).select('epi').sort({ epi: 'desc' });
                console.log(`There are ${partners.length} partners`);
                AffCounter.create({ _id: 'partnerid', seq: partners[0].epi })
            })()
        )
    })
};


// Abcdef-123*
// console.log(mongoose.isValidObjectId(newUser._id));
// console.log(mongoose.isValidObjectId(newUser.partner));
// console.log(mongoose.isValidObjectId(newUser.referredByPartner));

module.exports = {
    dataTransfer
}