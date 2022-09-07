var express = require('express');
var router = express.Router();
var moment=require('moment');
var User = require('../model/user');
var bcrypt=require('bcrypt');
var mongoose=require('mongoose');
var Verification = require('../model/verification');
var UtileMthods=require('../module/utilMethods');
var sendSms = require('../common/sendSms');
var result = require('../common/result');
router.get("/",(req,res)=>{
    res.send("welcome");
})
router.post('/signup',(req, res, next) => {
  User.find({
      email: req.body.email
  }).exec().then(user => {
      if (user.length >= 1) {
          return res.status(409).json({
              message: "Email Existed"
          });
      } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
              if (err) {
                  res.status(500).json({
                      error: err
                  })
              } else {

                  const user = new User({
                      _id: new mongoose.Types.ObjectId(),
                      email: req.body.email,
                      password: hash,
                      username:req.body.username,
                      joinDate:moment().valueOf(),
                      phoneNumber:req.body.phoneNumber
                    //   location:{
                    //       coordinates:[req.body.lon,req.body.lat]
                    //   }
                      // profilePic:req.file.path

                  });
                  user.save().then(result => {
                      console.log(result);
                      res.status(201).json({
                          message: "User Created",
                          CreatedUser: {
                              username: result.username,
                              email: result.email
                          }
                      })
                  }).catch(err => {
                      console.log(err);
                      res.status(500).json({
                          error: err
                      });
                  })
              }

          });
      }
  }).catch();
  
});
router.get('/verification/:phone', (request,response,next)=>{
    let phone = request.params.phone.slice(-11);
    console.log("verification- phone number", phone, moment().format("HH:mm:ss MM-DD-YYYY"));
    if (phone == undefined || phone == null || phone.trim() == "") {
        return response.status(200).send(result.object(false, ['لطفا شماره موبایل خود را وارد کنید']));
    } else if (phone.length != 11) {
        return response.status(200).send(result.object(false, ['شماره موبایل باید 11 رقمی باشد']));
    } else if (phone.startsWith("09") == false) {
        return response.status(200).send(result.object(false, ['شماره موبایل باید با فرمت *********09 وارد شود']));
    } else {
        Verification.findOne({ phone: phone }, null, { sort: { insertDate: -1 } }, function (errorFind, verificationFind) {
            if (errorFind) return response.status(200).send(result.object(false, [errorFind]));
            if (verificationFind) {
                let insertDate = moment(verificationFind.insertDate);
                let nowDate = moment(new Date());
                if (nowDate.diff(insertDate, 'minute') < 1) {
                    console.log("verification- try a minute later", phone, moment().format("HH:mm:ss MM-DD-YYYY"));
                    return response.status(200).send(result.object(false, ['لطفا بعد از یک دقیقه دوباره درخواست دهید']));
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
                            return response.status(200).send(result.object(false, ['خطای پیش بینی نشده ای پیش آمده، لطفا کمی بعد سعی کنید']));
                        } else {
                            return response.status(200).send(result.object(true, []));
                        }
                    })
                } else {
                    return response.status(200).send(result.object(false, ['خطای پیش بینی نشده ای پیش آمده، لطفا کمی بعد سعی کنید']));
                }
            })
        })
    }
});
router.post('/checkVerificationCode/:phone/:code',(request,response,next)=>{
    let phone = request.params.phone.slice(-11);
    Verification.findOne({ phone: phone }, null, { sort: { insertDate: -1 } }, function (error, verification) {
        if (error) return response.status(200).send(result.object(false, [error]));

        if (verification != null) {
            if (verification.code == request.params.code && new Date(verification.expireDate) >= new Date()) {
                User.findOne({ phoneNumber: phone }, { _id: true }, function (errorFind, currentUser) {
                    if (errorFind) return response.status(200).send(result.object(false, [errorFind]));
                    if (currentUser != null) {
                        let token = UtileMthods.generateJWT({ phoneNumber: phone, userId: currentUser._id });
                        return response.status(200).send(result.object(true, [{ token: token, isNewUser: false }]));
                    } else {
                        let oUser = new User();
                        oUser.phoneNumber=phone;
                        oUser.joinDate = moment().valueOf();
                        oUser.userName = "user" + UtileMthods.getRandomInt();
                        oUser.enteredAppBefore=false;
                        oUser.email = "";
                        oUser.save(function (errorSave, newUser) {
                            if (errorSave)
                                return response.status(200).send(result.object(false, [errorSave]));
                            else {
                                let token = UtileMthods.generateJWT({ phoneNumber: phone, userId: newUser._id ,enteredAppBefore:newUser.enteredAppBefore });
                                return response.status(200).send(result.object(true, [{ token: token, isNewUser: true }]));
                            }
                        })
                    }
                })
            } else {
                return response.status(200).send(result.object(false, ["کد وارد شده معتبر نمی باشد"]));
            }
        } else {
            return response.status(200).send(result.object(false, ["کد وارد شده معتبر نمی باشد"]));
        }
    })
});
router.post('/login',(request,response,next)=>{
 let token=request.body.token;
 UtileMthods.decodeJWT(token,(result,err)=>{
    if(err){
        response.status(401).json({
           err:err
        })
    }
    else if(result && result.sub.enteredAppBefore){
        response.status(401).json({
            message:'ok old bro'
        })
        // response.render('YOUR PAGE FOR THE OLD USERS COMES HERE');
        
    }
    else if(result && !result.sub.enteredAppBefore){
        let PhoneNo=result.sub.phoneNumber
        User.updateOne({phoneNumber:PhoneNo},{
            $set: {"enteredAppBefore":true}
        }).exec().then(result => {
            response.status(401).json({
                message:'ok new bro'
            })
            // response.render('YOUR PAGE FOR THE FIRST ENTERED USERS COMES HERE');
        })
       
    }
 })
})

module.exports = router;
