var path = require('path');

var AdminUser = require('../../model/adminUser');
var result = require("../../common/result");
var UtilMethods = require('../../module/utilMethods');

var dirroot = path.join(__dirname, '..', '..', 'public', 'pages', 'user');

class user {

    loginPage(request, responce) {
        return responce.sendFile(path.join(dirroot, 'login.html'));
    }

    userPage(request, responce) {
        return responce.sendFile(path.join(dirroot, 'update.html'));
    }

    put(request, responce) {
        let body = request.body;
        AdminUser.findOne({ _id: request.user._id, password: UtilMethods.sha256Hasher(body.oldPassword) }, function (error, user) {
            if (error) return responce.status(200).send(result.object(false, [error]));
            if (user) {
                user.password = UtilMethods.sha256Hasher(body.newPassword);
                user.save(function (errorSave, newUser) {
                    if (errorSave) return responce.status(200).send(result.object(false, [errorSave]));
                    return responce.status(200).send(result.object(true, []));
                })
            } else {
                return responce.status(200).send(result.object(false, ["رمز عبور قبلی صحیح نمی باشد"]));
            }

        })
    }

    currentUser(req, res) {
        return res.send({
            userName: req.user.userName,
            email: req.user.email,
        });
    }

}

var oUser = new user();
module.exports = oUser;