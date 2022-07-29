const createAuthForMailer = require('../configs/google');
const nodemailer = require('nodemailer');

// This function will use to send otp via sms
async function sendOtpEmail(email, otp , reason) {
    const {Auth_Client} = createAuthForMailer();
    const accesstoken = Auth_Client.getAccessToken();

    // creating transporter
    const transporter = await nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        service: 'gmail',
        secure: false,
        requireTLS: true,
        auth: {
            type: "OAuth2",
            user: "next.master.company@gmail.com",
            clientId : process.env.CLIENT_ID,
            clientSecret : process.env.CLIENT_SECRET,
            refreshToken:process.env.REFRESH_TOKEN,
            accessToken:accesstoken
        }
    });

    let mailOptions = {
        from: "next.master.company@gmail.com",
        to: email,
        subject: "Otp Verification",
        html: `<h3>Have you requested for otp?</h3><br>
        \t\t <p>This email is generated as per your request for ${reason} and your otp is ${otp}<br>
        Note:- Never share this otp to anyone else</p>`,
    }

    const sent = await transporter.sendMail(mailOptions, (error, info) => {

    });
}

// This function will use to send otp via sms
async function sendEmail(email, html , reason) {
    const {Auth_Client} = createAuthForMailer();
    const accesstoken = Auth_Client.getAccessToken();

    // creating transporter
    const transporter = await nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        service: 'gmail',
        secure: false,
        requireTLS: true,
        auth: {
            type: "OAuth2",
            user: "next.master.company@gmail.com",
            clientId : process.env.CLIENT_ID,
            clientSecret : process.env.CLIENT_SECRET,
            refreshToken:process.env.REFRESH_TOKEN,
            accessToken:accesstoken
        }
    });

    let mailOptions = {
        from: "next.master.company@gmail.com",
        to: email,
        subject: reason.substring(0 , 30),
        html,
    }

    const sent = await transporter.sendMail(mailOptions, (error, info) => {

    });
}

module.exports = {sendEmail , sendOtpEmail};