const {
    isNullOrUndefined,
  } = require('util');
  const crypto = require('crypto');
  const jwt = require('jsonwebtoken');
  const config = require('../config');
  
  class UtilMethods {
    isModelValid(obj, keys) {
      let haveProblem = false;
      keys.forEach((key) => {
        if (isNullOrUndefined(obj[key])) {
          haveProblem = true;
        }
      });
      return haveProblem;
    }
    getRandomInt() {
      return Math.floor(Math.random() * (9999999 - 1000000)) + 1000000;
    }
    generateJWT(payload) {
      return jwt.sign({
        iss: 'DELAVAZ',
        sub: payload,
      }, config.TOKEN_SECRET_KEY, {
          expiresIn: '90 days',
        });
    }
    md5Hasher(data) {
      const hash = crypto.createHash('md5');
      return hash.update(data).digest('hex');
    }
    sha256Hasher(data) {
      const hash = crypto.createHash('sha256');
      return hash.update(data).digest('hex');
    }
    decodeJWT(token,callback) {
      jwt.verify(token, config.TOKEN_SECRET_KEY, function (error, decode) {
        if (error) callback(null);
        callback(decode);
      });
    }
    verifyToken() {
      return `${Math.floor(Math.random() * (99999 - 10000)) + 10000}`;
    }
  }
  const utilMethohds = new UtilMethods();
  module.exports = utilMethohds;
  