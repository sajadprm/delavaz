var jwt = require('jsonwebtoken');
var config = require('../config');

var execute = function (userId, callback) {

    var varTokenOptions = {
        algorithm: config.TOKEN_ALGORITHM,
        expiresIn: config.TOKEN_EXPIRES_IN,
    };
    jwt.sign({ userId: userId }, config.TOKEN_SECRET_KEY, varTokenOptions, function (error, token) {
        callback(token);
    });
};


module.exports = execute;