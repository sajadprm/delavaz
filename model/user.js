var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: String,
    email: String,
    password: String,
    phoneNumber: String,
    joinDate: Number,
    enteredAppBefore: {Boolean, default:false}
    // location:{
    //     coordinates:[]
    // }
});

var User;
// userSchema.path('id').validate(function(n){
// })

if (mongoose.models.User) {
    User = mongoose.model('User');
} else {
    User = mongoose.model('User', userSchema);
}
module.exports = User; 