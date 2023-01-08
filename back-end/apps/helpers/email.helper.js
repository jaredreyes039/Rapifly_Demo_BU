// const nodemailer = require('nodemailer');
var sgMail = require('@sendgrid/mail');

function sendEmail(to_email, subject, body) {
    // var transport = nodemailer.createTransport({
    //     host: process.env.SMTP_HOST,
    //     // host: "smtp.gmail.com",
    //     secure: false,
    //     port: 465,
    //     // starttls: {
    //     //     enable: true
    //     // },
    //     auth: {
    //         user: process.env.SMTP_MAIL,
    //         pass: process.env.SMTP_PASSWORD
    //     }
    // });
    // var transport = nodemailer.createTransport("SMTP", {
    //     service: "Gmail",
    //     auth: {
    //         user: process.env.SMTP_MAIL,
    //         pass: process.env.SMTP_PASSWORD
    //     }
    // });
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        from: process.env.SENDGRID_FROM_EMAIL,
        to: to_email,
        // cc: "hardik@rentechdigital.com",
        subject: subject,
        html: body
    };

    // return transport.sendMail(message, function (err, info) {
    //     if (err) {
    //         console.log("returntransport.sendMail -> err", err)
    //         return err;
    //     } else {
    //         return info;
    //     }
    // });
    return sgMail.send(message).then((result) => {
        console.log('Message sent!');
        return result
    }).catch((err) => {
        console.log("mainController -> test -> err", err.response.body)
        return err
    });;
}

module.exports.sendEmail = sendEmail;