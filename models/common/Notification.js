const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true) 
const ms = require('ms');

const Schema = mongoose.Schema;

const Notification = new Schema({ 
    message: String,
    read: { 
        type: Boolean, 
        default: false 
    },
    type: String, // is this needed?
    createdAt: { 
        type: Date, 
        default: Date.now, // we don't call this function with Date.now() otherwise it would store it once,       
        index: true // Have to include this to make it work
    },    
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
});


Notification.index({ 'createdAt': 1 }, { 'expireAfterSeconds' : ms('14 days') / 1000 }) // have to divide between 1000 to get seconds for expireAfterSeconds - NOT milliseconds


// Notes
// After 4 days, finally discovered the reason it wasn't working was I need to put index: true on the field
// Can't do mocha test to check if expired because even though we can use fake timers using sinon, we cannot mock the database to move forward 2 weeks.

// Useful links:
// https://docs.mongodb.com/manual/reference/method/db.dropDatabase/
// https://stackoverflow.com/questions/22106271/mongoose-change-ttl-for-a-single-document
// https://www.albertgao.xyz/2019/02/07/how-to-auto-delete-mongodb-records-after-certain-time-with-mongoose/
// https://stackoverflow.com/questions/13014548/what-is-the-recommended-way-to-drop-indexes-using-mongoose
// https://stackoverflow.com/questions/47867114/how-to-get-the-defined-indexes-from-mongoose
// https://stackoverflow.com/questions/24008956/time-to-live-in-mongodb-mongoose-dont-work-documents-doesnt-get-deleted/24010025
// https://stackoverflow.com/questions/29525010/mongoose-expires-property-not-working-properly
// https://stackoverflow.com/questions/22470172/cant-make-mongoose-expires-ttl-to-work
// https://stackoverflow.com/questions/52558218/mongodb-documents-expiring-too-soon-mongoose
// https://stackoverflow.com/questions/37136204/mongoerror-ns-not-found-when-try-to-drop-collection
// https://stackoverflow.com/questions/14342708/mongoose-indexing-in-production-code
// https://stackoverflow.com/questions/13272839/using-ensureindex-in-mongodb-schema-using-mongoose
// https://stackoverflow.com/questions/35388957/mongoose-indexes-dont-get-created-half-the-time-on-mocha-tests
// https://stackoverflow.com/questions/12452865/mongoose-not-creating-indexes/12453041
// https://stackoverflow.com/questions/38308011/mongoose-is-not-recreating-the-index-collection-is-dropped
// Notification.collection.dropIndexes(function (err, results) { // delete index 
//     // Handle errors
// });
// Notification.collection.getIndexes({ full: true }).then(indexes => { // cannot do this directly on schema  -
//     console.log('indexes:', indexes);
// }).catch(console.error);

module.exports = mongoose.model('notification', Notification);
