var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminUserSchema = new Schema({
  id: Number,
  firstName: String,
  lastName: String,
  email: String,
  userName: String,
  password: String,
});

var AdminUser;
if (mongoose.models.AdminUser) {
  AdminUser = mongoose.model('AdminUser');
} else {
  AdminUser = mongoose.model('AdminUser', adminUserSchema);
}
module.exports = AdminUser;