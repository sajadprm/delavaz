var moment = require('moment');
var Verification = require('../../model/verification');
var User = require('../../model/user');
var sendSms = require('../../common/sendSms');
var result = require('../../common/result');
var UtileMthods = require('../../module/utilMethods');


class user {

    verification(request, responce) {
        let phone = request.params.phone.slice(-11);
        console.log("verification- phone number", phone, moment().format("HH:mm:ss MM-DD-YYYY"));
        if (phone == undefined || phone == null || phone.trim() == "") {
            return responce.status(200).send(result.object(false, ['لطفا شماره موبایل خود را وارد کنید']));
        } else if (phone.length != 11) {
            return responce.status(200).send(result.object(false, ['شماره موبایل باید 11 رقمی باشد']));
        } else if (phone.startsWith("09") == false) {
            return responce.status(200).send(result.object(false, ['شماره موبایل باید با فرمت *********09 وارد شود']));
        } else {
            Verification.findOne({ phone: phone }, null, { sort: { insertDate: -1 } }, function (errorFind, verificationFind) {
                if (errorFind) return responce.status(200).send(result.object(false, [errorFind]));
                if (verificationFind) {
                    let insertDate = moment(verificationFind.insertDate);
                    let nowDate = moment(new Date());
                    if (nowDate.diff(insertDate, 'minute') < 1) {
                        console.log("verification- try a minute later", phone, moment().format("HH:mm:ss MM-DD-YYYY"));
                        return responce.status(200).send(result.object(false, ['لطفا بعد از یک دقیقه دوباره درخواست دهید']));
                    }
                }
                let verification = new Verification();
                verification.phone = phone;
                verification.code = Math.floor(Math.random() * (99999 - 10000)) + 10000;				
                console.log("verification- CODE", verification.phone, verification.code, moment().format("HH:mm:ss MM-DD-YYYY"));
                verification.insertDate = new Date();
                sendSms.sendVeifySMS(verification.code, verification.phone, async (data) => {
					console.log("data is:", data);
                    if (data && data.status && data.status == 200) {
                        let d1 = new Date();
                        let d2 = new Date(d1);
                        d2.setHours(d1.getHours() + 2);
                        verification.expireDate = d2;
                        verification.save(function (errorSave) {
                            if (errorSave) {
                                return responce.status(200).send(result.object(false, ['خطای پیش بینی نشده ای پیش آمده، لطفا کمی بعد سعی کنید']));
                            } else {
                                return responce.status(200).send(result.object(true, []));
                            }
                        })
                    } else {
                        return responce.status(200).send(result.object(false, ['خطای پیش بینی نشده ای پیش آمده، لطفا کمی بعد سعی کنید']));
                    }
                })
            })
        }
    };

    checkVerificationCode(request, responce) {
        let phone = request.params.phone.slice(-11);
        Verification.findOne({ phone: phone }, null, { sort: { insertDate: -1 } }, function (error, verification) {
            if (error) return responce.status(200).send(result.object(false, [error]));

            if (verification != null) {
                if (verification.code == request.params.code && new Date(verification.expireDate) >= new Date()) {
                    User.findOne({ phoneNumber: phone }, { _id: true }, function (errorFind, currentUser) {
                        if (errorFind) return responce.status(200).send(result.object(false, [errorFind]));
                        if (currentUser != null) {
                            let token = UtileMthods.generateJWT({ phoneNumber: phone, userId: currentUser._id });
                            return responce.status(200).send(result.object(true, [{ token: token, isNewUser: false }]));
                        } else {
                            let oUser = new User();
                            oUser.userName = "user" + UtileMthods.getRandomInt();
                            oUser.phoneNumber = phone;
                            oUser.isActive = true;
                            oUser.score = 10;
                            oUser.activeRequestValue = 0;
                            oUser.wallet.cash = 0;
                            oUser.wallet.ben = 0;
                            oUser.wallet.award = 0;
                            oUser.email = "";
                            oUser.benUse = [];
                            oUser.save(function (errorSave, newUser) {
                                if (errorSave)
                                    return responce.status(200).send(result.object(false, [errorSave]));
                                else {
                                    let token = UtileMthods.generateJWT({ phoneNumber: phone, userId: newUser._id });
                                    return responce.status(200).send(result.object(true, [{ token: token, isNewUser: true }]));
                                }
                            })
                        }
                    })
                } else {
                    return responce.status(200).send(result.object(false, ["کد وارد شده معتبر نمی باشد"]));
                }
            } else {
                return responce.status(200).send(result.object(false, ["کد وارد شده معتبر نمی باشد"]));
            }
        })
    };

    putUser(request, responce) {
        let body = request.body;
        let uname = body.userName ? body.userName.trim() : "";
        User.findOne({ userName: uname }, function (error, duplicatedUser) {
            if (duplicatedUser) {
                User.findOne({ _id: request.user._id }, function (error, currentUser) {
                    if (error) return responce.status(200).send(result.object(false, [error]));
                    if (currentUser && currentUser.userName.trim() != uname) {
                        return responce.status(200).send(result.object(false, ["این نام کاربری از قبل وجود دارد"]));
                    } else {
                        let newUser = {};
                        newUser.firstName = body.firstName;
                        newUser.lastName = body.lastName;
                        newUser.userName = body.userName;
                        let temp = newUser.userName ? newUser.userName.trim() : null;
                        if (!temp || temp.length < 3) {
                            return responce.status(200).send(result.object(false, ["نام کاربری باید حداقل 3 کاراکتر باشد"]));
                        } else {
                            newUser.email = body.email;
                            newUser.avatar = body.avatar;
                            newUser.isActive = true;
                            User.findByIdAndUpdate({ _id: request.user._id }, newUser, function (error, updatedUser) {
                                if (error) return responce.status(200).send(result.object(false, [error]));
                                if (updatedUser != null) {
                                    return responce.status(200).send(result.object(true, []));
                                } else {
                                    return responce.status(200).send(result.object(false, ["ثبت اطلاعات با خطا مواجه شده است"]));
                                }
                            });
                        }
                    }
                })
            } else {
                let newUser = {};
                newUser.firstName = body.firstName;
                newUser.lastName = body.lastName;
                newUser.userName = body.userName;
                let temp = newUser.userName ? newUser.userName.trim() : null;
                if (!temp || temp.length < 3) {
                    return responce.status(200).send(result.object(false, ["نام کاربری باید حداقل 3 کاراکتر باشد"]));
                } else {
                    newUser.email = body.email;
                    newUser.avatar = body.avatar;
                    newUser.isActive = true;
                    User.findByIdAndUpdate({ _id: request.user._id }, newUser, function (error, updatedUser) {
                        if (error) return responce.status(200).send(result.object(false, [error]));
                        if (updatedUser != null) {
                            return responce.status(200).send(result.object(true, []));
                        } else {
                            return responce.status(200).send(result.object(false, ["ثبت اطلاعات با خطا مواجه شده است"]));
                        }
                    });
                }
            }
        })
    }


    profile(request, responce) {
        User.findOne({ _id: request.user._id }, { _id: false, firstName: true, lastName: true, email: true, phoneNumber: true, score: true, activeRequestValue: true, wallet: true, userName: true }, function (error, user) {
            if (error)
                return responce.status(200).send(result.object(false, [error]));
            else
                return responce.status(200).send(result.object(true, [user]));
        })
    };




    lastVersion(request, responce) {
        console.log("request-token", request.body.token);
        var token = request.body.token;
        let value = { last: 0.7, least: 0.7, isLogin: false };
        if (token) {
            value.isLogin = true;
        }
        console.log("isLogin", value);
        return responce.status(200).send(result.object(true, value));
    }
}

var oUser = new user();
module.exports = oUser;