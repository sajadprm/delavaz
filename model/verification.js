var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var verificationSchema = new Schema({
    id: Number,
    phone: String,
    code: String,
    insertDate: Date,
    expireDate: Date,
});

var Verification = mongoose.model('Verification', verificationSchema);
module.exports = Verification; 