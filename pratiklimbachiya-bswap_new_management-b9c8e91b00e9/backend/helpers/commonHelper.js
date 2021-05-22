const {
    initConfigs
} = require('../configs');
var nodemailer = require('nodemailer');

const commonHelper = {}

commonHelper.sendEmail = async function (to, msg, subject, next) {

    var transporter = nodemailer.createTransport({
        host: initConfigs.EMAIL_HOST,
        secureConnection: true,
        port: initConfigs.EMAIL_PORT,
        auth: {
            user: initConfigs.EMAIL_CREDENTIAL_USERNAME,
            pass: initConfigs.EMAIL_CREDENTIAL_PASSWORD
        }
    });

    var mailOptions = {
        from: initConfigs.EMAIL_CREDENTIAL_USERNAME,
        to: to,
        subject: subject,
        html: msg
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            next(true);
        }
    });
}

module.exports = commonHelper;
