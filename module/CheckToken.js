var jwt = require('jsonwebtoken');
var config = require('../config');

var mongoose = require('mongoose');
var User = require('../model/user');

var execute = function (token, callback) {
    jwt.verify(token, config.TOKEN_SECRET_KEY, function (error, decode) {
        if (error) callback(error, false);
        if (decode) {
            User.findOne({ _id: decode.userId }, function (err, data) {
                if (err) callback(err, false);
                if (data) {
                    callback(undefined, true, data._id);
                } else {
                    callback(undefined, false);
                }
            })
        }
    })
};

module.exports = execute;