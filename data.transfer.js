const mongoose = require('mongoose');
const request = require('superagent');
require('superagent-proxy')(request);

const { v4: uuidv4 } = require('uuid');
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
    AffCounter,
    AffNotification,
    AffPayment,
    AffReportMonthly,
    AffReportDaily,
    AffSubReport
} = require('./models/affiliate/index');

const { User, UserCounter, Brand } = require('./models/common/index');

const { 
    Account,
    ActiveUser, 
    Application,
    Payment,
    Report, 
    SubReport,     
} = require('./models/personal/index');

const { Admin } = require('./models/admin/index');
const { setCurrency } = require('./config/deals');

// mongoose.Types.ObjectId(_id);

const dataTransfer = async () => {
    // await UserCounter.deleteMany();
    // await AffCounter.deleteMany();
    // await User.deleteMany();
    // await ActiveUser.deleteMany();
    // await AffPartner.deleteMany();
    // await AffAccount.deleteMany();
    // await AffReport.deleteMany();
    // await AffApplication.deleteMany();
    // await AffNotification.deleteMany();
    // await AffPayment.deleteMany();
    // await AffReportDaily.deleteMany();
    // await AffReportMonthly.deleteMany();
    // await AffSubReport.deleteMany();

    // await Brand.deleteMany();
    // await Admin.deleteMany();

    // await Application.deleteMany();
    // await Account.deleteMany();
    // await Report.deleteMany();
    // await Payment.deleteMany();
    await SubReport.deleteMany();

    // await setInitialUserData();
    // await setInitialPartnerData();
    // await setUserCounter(); // Only call when first transferring data
    // await setAffCounter(); // Only call when first transferring data - Have to call this before updateInitialUserData() otherwise we will not have AffCounter
    // await updateInitialUserData(); // fetch data by user _id and then map to activeuser
    // await setInitialAffAccountData();
    // await setInitialAffReportData();
    // await setInitialAffApplicationData();
    // await setInitialAffNotificationData();
    // await setInitialAffPayments();
    // await setInitialAffReportDailyData();
    // await setInitialAffReportMonthlyData();
    // await setInitialAffSubReportMonthlyData();

    // await setBrandData()
    // await setAdmin();

    // await setInitialApplicationData();
    // await setInitialAccounts();
    // await setInitialReports();
    // await setInitialPayments();
    // await setInitialRafPayments();
    await setInitialSubReports();   // NEED TO SET SUBREPORTS TOO OTHERWISE WON'T CALCULATE BALANCES CORRECTLY - REFER TO map-act-dashboard-data

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

                    await users.reduce(async (previous, next) => {
                        await previous;
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
                        } = next;


                        const existing = await User.findById(_id);
                        if (existing) return new Promise(resolve => resolve(next));
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
    
                            return new Promise(resolve => resolve(next));
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
                    await partners.reduce(async (previous, next) => {
                        await previous;
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
                        } = next;

                        const existing = await AffPartner.findById(_id).select('_id')
                        if (existing) return new Promise(resolve => resolve(next));
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
    
                            return new Promise(resolve => resolve(next));
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
                    await users.reduce(async (previous, next) => {
                        await previous;
                        const {
                            _id,
                            email,
                            isPartner,
                            referredBy,
                            partner
                        } = next;

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

                        return new Promise(resolve => resolve(next));
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
                    
                    await accounts.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            brand,
                            account,
                            dateAdded,
                            // reports,
                            belongsTo
                        } = next;
                        
                        const existing = await AffAccount.findById(_id);
                        if (existing) return new Promise(resolve => resolve(next));
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
                            
                            return new Promise(resolve => resolve(next));
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
            (async () => { // CHECK AMOUNTS AS WE GETTING NaN error for some
                try {
                    const reports = (await request.get('http://localhost:5000/data/get-aff-reports')).body;
                    
                    await reports.reduce(async (previous, next) => {
                        await previous;
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
                                subAffCommission,
                                earnedFee
                            },
                            belongsTo,
                            belongsToPartner
                        } = next;
                        
                        const newSubAffCommission = subAffCommission ? subAffCommission : 0;
                        const newCashbackRate = (cashback > 0) ? (cashback / transValue) : 0;
                        const newCommissionRate = (commission > 0) ? (commission / transValue) : 0;
                        const newProfit = commission > 0 ? commission - (cashback + newSubAffCommission) : 0;

                        const existing = await AffReport.findById(_id);
                        if (existing) return new Promise(resolve => resolve(next));
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
                                'account.commissionRate': newCommissionRate,
                                'account.cashbackRate': newCashbackRate,
                                'account.subAffCommission': newSubAffCommission,
                                'account.profit': newProfit,
                                'account.currency': setCurrency(brand),                             
                                belongsTo,
                                belongsToPartner
                            });

                            if (earnedFee) newReport.account.earnedFee = earnedFee;

                            const updatedReport = await AffReport.create(newReport);

                            await AffAccount.findByIdAndUpdate(newReport.belongsTo, {
                                $push: {
                                    accounts: updatedReport
                                }
                            }, { new: true, select: 'accounts' });
                            
                            return new Promise(resolve => resolve(next));
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
                    const accounts = (await request.get('http://localhost:5000/data/get-aff-applications')).body;
                    
                    await accounts.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            brand,
                            accountId,
                            email,
                            status,
                            upgradeStatus,
                            dateAdded,
                            belongsTo
                        } = next;
                        
                        const existing = await AffApplication.findOne(
                            { $or: [ { accountId }, { _id } ] }
                        );
                        if (existing) return new Promise(resolve => resolve(next));
                        else {
                            const newApplication = new AffApplication({
                                _id,
                                brand,
                                accountId,
                                status,
                                upgradeStatus,
                                'availableUpgrade.status': '-',
                                'availableUpgrade.valid': upgradeStatus.includes('Not verified') ? true : false,
                                requestCount: 1,
                                currency: setCurrency(brand),
                                dateAdded: Number(dayjs(dateAdded).format('x')), 
                                belongsTo
                            });

                            if (email) newApplication.email = email;

                            await AffApplication.create(newApplication);
                            
                            return new Promise(resolve => resolve(next));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialAffNotificationData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-aff-notifications')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            message,
                            read,
                            type,
                            createDate,
                            belongsTo
                        } = next;
                        
                        const existing = await AffNotification.findOne(
                            { $or: [ { _id } ] }
                        );
                        if (existing) return new Promise(resolve => resolve(next));
                        else {
                            const newNotification = new AffNotification({
                                _id,
                                message,
                                read: true,
                                type,
                                createdAt: Number(dayjs(createDate).format('x')), 
                                belongsTo
                            });

                            await AffNotification.create(newNotification);
                            
                            return new Promise(resolve => resolve(next));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialAffPayments = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-aff-payments')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            amount,
                            status,
                            requestDate,
                            paidDate,
                            transactionId,
                            currency,
                            belongsTo
                        } = next;
                        
                        const existing = await AffPayment.findOne(
                            { $or: [ { _id } ] }
                        );
                        if (existing) return new Promise(resolve => resolve(next));
                        else {

                            const newPayment = new AffPayment({
                                _id,
                                amount,
                                status,
                                requestDate: Number(dayjs(requestDate).format('x')),  
                                transactionId,
                                currency,
                                belongsTo
                            });

                            if (paidDate) newPayment.paidDate = Number(dayjs(paidDate).format('x'));

                            await AffPayment.create(newPayment);
                            
                            return new Promise(resolve => resolve(next));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialAffReportDailyData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-aff-daily')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            epi,
                            date,
                            period,
                            clicks,
                            registrations,
                            transValue,
                            brand,
                            belongsTo
                        } = next;
                        
                        const existing = await AffReportDaily.findOne(
                            { $or: [ { _id } ] }
                        );
                        if (existing) return new Promise(resolve => resolve(next));
                        else {

                            const newReport = new AffReportDaily({
                                _id,
                                epi,
                                date: Number(dayjs(date).format('x')),  
                                period,
                                clicks,
                                registrations,
                                deposits: 0,
                                transValue,
                                commission: 0,
                                brand,
                                belongsTo
                            });

                            if (clicks > 0 || registrations > 0 || transValue > 0) {
                                await AffReportDaily.create(newReport);
                            };
                            return new Promise(resolve => resolve(next));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialAffReportMonthlyData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-aff-reports-monthly')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            date,
                            month,
                            lastUpdate,
                            brand,
                            transValue,
                            commission,
                            cashback,
                            cashbackRate,
                            subAffCommission,
                            belongsTo
                        } = next;

                        const newSubAffCommission = subAffCommission ? subAffCommission : 0;
                        const newCashbackRate = (cashback > 0) ? (cashback / transValue) : 0;
                        const newCommissionRate = (commission > 0) ? (commission / transValue) : 0;
                        const newProfit = commission > 0 ? commission - (cashback + newSubAffCommission) : 0;
                        
                        const existing = await AffReportMonthly.findOne(
                            { $or: [ { _id } ] }
                        );
                        if (existing) return new Promise(resolve => resolve(next));
                        else {

                            const newReport = new AffReportMonthly({
                                _id,
                                date: Number(dayjs(date).format('x')),  
                                month,
                                lastUpdate: Number(dayjs(lastUpdate).format('x')),  
                                brand,
                                transValue,
                                commission,
                                cashback,
                                cashbackRate,
                                subAffCommission: newSubAffCommission,
                                cashbackRate: newCashbackRate,
                                commissionRate: newCommissionRate,
                                currency: setCurrency(brand),
                                profit: newProfit,
                                // epi: Number, // set through hooks
                                // referredByEpi: Number, // set through hooks
                                belongsTo
                            });

                            await AffReportMonthly.create(newReport);

                            return new Promise(resolve => resolve(next));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialAffSubReportMonthlyData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-aff-sub-reports-monthly')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            date,
                            month,
                            brand,
                            email,
                            epi,
                            transValue,
                            commission,
                            cashback,
                            subAffCommission,
                            belongsTo
                        } = next;

                        const newSubAffCommission = subAffCommission ? subAffCommission : 0;
                        const newCashbackRate = (cashback > 0) ? (cashback / transValue) : 0;

                        const existing = await AffSubReport.findOne(
                            { $or: [ { _id } ] }
                        );
                        if (existing) return new Promise(resolve => resolve(next));
                        else {

                            const newReport = new AffSubReport({
                                _id,
                                date: Number(dayjs(date).format('x')),  
                                month,
                                brand,
                                email,
                                epi,
                                transValue,
                                deposits: 0,
                                commission,
                                cashback,
                                subAffCommission: newSubAffCommission,
                                cashbackRate: newCashbackRate,
                                currency: setCurrency(brand),
                                belongsTo
                            });

                            await AffSubReport.create(newReport);

                            return new Promise(resolve => resolve(next));
                        };
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};


const setAdmin = () => {
    return new Promise(resolve => resolve(
        (async () => {
            const data = (await request.get('http://localhost:5000/data/get-admins')).body;
            const {
                _id,
                firstName,
                lastName,
                username,
                email,
                password
            } = data;
            await Admin.create({
                _id,
                name: `${firstName} ${lastName}`,
                username,
                email,
                password
            })
        })()
    ))
}

const setBrandData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    await Brand.create({
                        brand: 'Skrill',
                        initialUpgrade: 'Fast Silver',
                        link: 'http://wlskrill.adsrv.eacdn.com/C.ashx?btag=a_75418b_3806c_&affid=37901&siteid=75418&adid=3806&c=',
                        branding: {
                            colorHex: '#811e68',
                            colorClass: 'is-danger',
                            currencyValue: 'USD',
                            currencySymbol: '$'
                        },
                        benefits: [
                            'Instant VIP Bronze Status',
                            'Easier VIP Targets For Higher Levels',
                            'Verification Without Deposit',
                            'Fast Track Verification - 24 hours',
                            'Lower Fees & Higher Limits',
                            'Most Generous Rewards Program',
                            'Additional Skrill VIP Rewards',
                            'Personalised Support & Care'
                        ],
                        terms: [
                            ''
                        ]
                    });
                    await Brand.create({
                        brand: 'Neteller',
                        initialUpgrade: 'Bronze Pro',
                        link: 'http://wlneteller.adsrv.eacdn.com/C.ashx?btag=a_75417b_1c_&affid=53&siteid=75417&adid=1&c=',
                        branding: {
                            colorHex: '#83ba3b',
                            colorClass: 'is-black',
                            currencyValue: 'USD',
                            currencySymbol: '$'
                        },
                        benefits: [
                            'Instant VIP Bronze Pro Status',
                            'Fast Track Silver VIP - $7,500',
                            'Easier VIP Targets For Higher Levels',
                            'Verification Without Deposit',
                            'Fast Track Verification - 24 hours',
                            'Lower Fees & Higher Limits',
                            'Most Generous Rewards Program',
                            'Additional Neteller VIP Rewards',
                            'Personalised Support & Care'
                        ],
                        terms: [
                            ''
                        ]
                    });
                    await Brand.create({
                        brand: 'ecoPayz',
                        initialUpgrade: 'Gold',
                        link: 'https://secure.ecopayz.com/Registration.aspx?_atc=gmrgyswlyhop7nwyfeuthj75p',
                        branding: {
                            colorHex: '#033564',
                            colorClass: 'is-dark',
                            currencyValue: 'EUR',
                            currencySymbol: '€'
                        },
                        benefits: [
                            'Instant VIP Gold Status',
                            'FREE P2P Transfers',
                            'Cashback & Commission On Transfers',
                            'Highest Cashback Guarantee',
                            'Fast Track Verification - 24 hours',
                            'Lower Fees & Higher Limits',
                            'Most Generous Rewards Program',
                            'Personalised Support & Care'
                        ],
                        terms: [
                            'Following countries will receive Silver VIP upgrade instead of Gold: UK, Canada, Bangladesh',
                            'Following countries not eligible for cashback/commission: India, China, Japan, Turkey and Persian Gulf Countries'
                        ]
                    });
                    await Brand.create({
                        brand: 'MuchBetter',
                        branding: {
                            colorHex: '#C85F31',
                            colorClass: 'is-dark',
                            currencyValue: 'EUR',
                            currencySymbol: '€'
                        },
                        benefits: [],
                        terms: []
                    })
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
}

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


// Personal Models / data
// Number(dayjs(date).format('x')),  

const setInitialAccounts = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-accounts')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            brand,
                            account: {
                                accountId,
                                regDate,
                                country
                            },
                            accountEmail,
                            belongsTo
                        } = next;
                        
                        const existing = await Account.findOne(
                            { $or: [ { _id } ] },
                            { select: '_id' }
                        );
                        if (existing) return new Promise(resolve => resolve(next));
                        else {
                            const newAccount = new Account({
                                _id,
                                brand,
                                accountId,
                                dateAdded: regDate ? (typeof regDate === 'date' ? Number(dayjs(regDate).format('x')) : Number(dayjs().format('x'))) : Number(dayjs().format('x')),  
                                accountEmail,
                                country
                                // reports: [] // push to this when we create Report
                            });

                            if (belongsTo) { // if original account belons to user - find user and activeuser and set belongsTo activeuser
                                const user = await User.findById(belongsTo).select('activeUser')
                                if (user) {
                                    newAccount.belongsTo = user.activeUser;
                                }
                            };
                            
                            const createdAccount = await Account.create(newAccount); // create account

                            if (createdAccount.belongsTo) { // if created account belongs to an activeuser, push account to activeuser array
                                await ActiveUser.findByIdAndUpdate(createdAccount.belongsTo, {
                                    $push: {
                                        accounts: createdAccount
                                    }
                                }, { select: 'accounts' })
                            };                            
                            return new Promise(resolve => resolve(next));
                        };

                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialReports = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-reports')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            monthId,
                            brand,
                            account: {
                                accountId,
                                deposits,
                                transValue,
                                commission,
                                cashback,
                                rafCommission
                            },
                            belongsTo,
                            belongsToUser
                        } = next;
                        
                        const existing = await Report.findOne(
                            { $or: [ { _id } ] }
                        );
                        if (existing) return new Promise(resolve => resolve(next));
                        else {

                            const newCashbackRate = commission === 0 ? 0 : cashback / transValue;
                            const newCommissionRate = commission === 0 ? 0 : commission / transValue;
                            const newRafCommission = rafCommission ? rafCommission : 0;
                            const newProfit = commission === 0 ? 0 : commission - (cashback + newRafCommission);

                            let account = await Account.findOne({ accountId }).select('accountId country');
                            if (!account) { // for rare occurences where (circa 5) where Report does not have a corresponding Account
                                account = await Account.create({
                                    brand,
                                    accountId,
                                    dateAdded: Number(dayjs().format('x')),  
                                    accountEmail: '',
                                    country: 'GB'
                                })
                            }; 

                            const newReport = new Report({
                                _id,
                                date: Number(dayjs(monthId).startOf('month').format('x')),
                                month: monthId, 
                                lastUpdate: Number(dayjs(monthId).endOf('month').format('x')),
                                brand,
                                country: account.country ? account.country : '',
                                account: {
                                    accountId,  
                                    deposits,
                                    transValue,
                                    commission,
                                    cashback, // Y
                                    cashbackRate: newCashbackRate,
                                    commissionRate: newCommissionRate,
                                    rafCashback: rafCommission, // Y
                                    currency: setCurrency(brand),
                                    profit: newProfit
                                },
                                belongsTo: account._id
                            });

                            if (belongsToUser) {
                                const user = await User.findById(belongsToUser).select('activeUser');
                                if (user) newReport.belongsToActiveUser = user.activeUser;
                            }

                            const createdReport = await Report.create(newReport);

                            if (createdReport.belongsTo) { // if report belongs to account - add 
                                await Account.findByIdAndUpdate(belongsTo, {
                                    $push: {
                                        reports: createdReport
                                    }
                                }, { select: 'reports' });
                            };        
                            return new Promise(resolve => resolve(next));
                        };

                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialApplicationData = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-applications')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            _id,
                            brand,
                            accountId,
                            accountEmailAddress,
                            accountCurrency,
                            status,
                            upgradeStatus,
                            timestamp,
                            belongsTo
                        } = next;

                        const existing = await Application.findOne(
                            { $or: [ { accountId }, { _id } ] }
                        );
                        if (existing) return new Promise(resolve => resolve(next));
                        else {
                            const newApplication = new Application({
                                _id,
                                brand,
                                accountId,
                                email: accountEmailAddress,
                                status: status,
                                upgradeStatus: upgradeStatus ? upgradeStatus : status,
                                'availableUpgrade.status': '-',
                                'availableUpgrade.valid': upgradeStatus ? (upgradeStatus.includes('Not verified') ? true : false) : false,
                                requestCount: 1,
                                currency: accountCurrency,
                                dateAdded: Number(dayjs(timestamp).format('x')),  
                            });

                            if (belongsTo) {
                                const user = await User.findById(belongsTo);
                                if (user) newApplication.belongsTo = user.activeUser;
                            };
                            
                            await Application.create(newApplication);
                            
                            return new Promise(resolve => resolve(next));
                        };

                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialPayments = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-payments')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            account: { cashback },
                            paymentEmail,
                            status,
                            belongsToUser,
                            monthId,
                            brand
                        } = next;
                        
                        const newPayment = new Payment({
                            
                            amount: cashback,
                            status,
                            requestDate: Number(dayjs(monthId).endOf('month').format('x')),
                            paidDate: Number(dayjs(monthId).endOf('month').format('x')),
                            transactionId: uuidv4(),
                            currency: setCurrency(brand),
                            brand,
                            paymentAccount: paymentEmail, // can be email for Skrill, Neteller & ecoPayz and phoneCode + phoneNumber for MuchBetter and wallet address for 
                        });

                        const user = await User.findById(belongsToUser).select('_id activeUser');
                        if (!user) {
                            console.log('next: ', next);
                            console.log(newPayment);
                        }
                        newPayment.belongsTo = user.activeUser;

                        await Payment.create(newPayment);
                        
                        return new Promise(resolve => resolve(next));
                        
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const setInitialRafPayments = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                try {
                    const data = (await request.get('http://localhost:5000/data/get-raf-payments')).body;
                    
                    await data.reduce(async (previous, next) => {
                        await previous;
                        const { // [1] old fields
                            amount,
                            status,
                            requestDate,
                            paidDate,
                            transactionId,
                            belongsTo
                        } = next;
                        
                        const newPayment = new Payment({
                            
                            amount,
                            status,
                            requestDate: Number(dayjs(requestDate).format('x')),
                            paidDate: Number(dayjs(paidDate).format('x')),
                            transactionId,
                            currency: setCurrency('Neteller'),
                            brand: 'Neteller',
                            paymentAccount: 'goonergoon1914@gmail.com', // can be email for Skrill, Neteller & ecoPayz and phoneCode + phoneNumber for MuchBetter and wallet address for 
                        });

                        const user = await User.findById(belongsTo).select('_id activeUser');
                        newPayment.belongsTo = user.activeUser;

                        const createdPayment = await Payment.create(newPayment);
                        
                        return new Promise(resolve => resolve(next));
                        
                    }, Promise.resolve())
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};


const setInitialSubReports = () => {
    return new Promise(resolve => {
        resolve(
            (async () => {
                const data = (await request.get('http://localhost:5000/data/get-reports-with-raf')).body;
                    
                await data.reduce(async (previous, next) => {
                    await previous;

                    const {
                        date,
                        month,
                        lastUpdate,
                        commission,
                        transValue,
                        belongsTo // user
                    } = next;


                    if (transValue > 0 || commission > 0) {
                        const newReport = new SubReport({ // set currecny instead of brand
                            date: Number(dayjs(date).format('x')), 
                            month,
                            lastUpdate: Number(dayjs(lastUpdate).format('x')), 
                            userId: 0,
                            transValue,
                            deposits: 0,
                            commission,
                            cashback: commission * 20,
                            rafCommission: commission,
                            cashbackRate: commission === 0 ? 0 : (commission * 20) / transValue,
                            currency: setCurrency('Neteller'), // use currency instead of brand - we using 'Neteller' here as this will set all current reports to USD
                        });
    
                        if (commission > 0) console.log(newReport)
    
                        const user = await User.findById(belongsTo).select('_id activeUser');
                        newReport.belongsTo = user.activeUser;
    
                        await SubReport.create(newReport);
                    }
                    return new Promise(resolve => resolve(next));
                    
                }, Promise.resolve())
            })() 
        )
    })  
}


// Abcdef-123*
// console.log(mongoose.isValidObjectId(newUser._id));
// console.log(mongoose.isValidObjectId(newUser.partner));
// console.log(mongoose.isValidObjectId(newUser.referredByPartner));

module.exports = {
    dataTransfer
}