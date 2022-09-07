
// var http = require('http');
// var execute = function (phone, code, callback) {
//     var headers = {
//         "Content-Type": "text/html,application/xhtml+xml; charset=utf-8",
//         'Accept-Charset': 'utf-8'
//     };

//     let text = encodeURIComponent(`کد فعال سازی: ${code}`);

//     var options = {
//         host: "sibsms.com",
//         port: 80,
//         path: `/APISend.aspx/?Username=behi1ty&Password=09361253973&From=-1&To=${phone}&Text=${text}`,
//         method: "Get",
//         headers: headers
//     };

//     var req = http.request(options, (res) => {
//         res.setEncoding('utf8');
//         res.on('data', (chunk) => {
//             if (chunk.trim() == "1") {
//                 callback(undefined, true);
//             } else {
//                 callback(undefined, false);
//             }
//         });
//     });

//     req.on('error', (e) => {
//         callback(e, false);
//     });
//     req.end();
// }

// module.exports = execute;


const { KavenegarApi } = require('kavenegar');

var config = require('../config');


class SMSProvider {
    constructor() {
        this.kavenegar = new KavenegarApi({
            apikey: config.kavenegar.apiKey,
        });
    }
    sendVeifySMS(token, phonNumber, callback) {
        this.kavenegar.VerifyLookup({
            receptor: phonNumber,
            token,
            template: config.kavenegar.templates.lookup,
        }, (response, status) => callback({
            response,
            status,
        }));
    }

    sendSMS(senderPhoneNumber, recieverPhonNumber, msg, callback) {
        this.kavenegar.Send({
            message: msg,
            sender: senderPhoneNumber,
            receptor: recieverPhonNumber
        }, (response, status) => callback({
            response,
            status
        }));
    }
}
const smsProvider = new SMSProvider();
module.exports = smsProvider;
