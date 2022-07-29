const { google } = require("googleapis");

const createAuthForMailer = () => {
    const Auth_Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

    Auth_Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

    return {Auth_Client};
}

module.exports = createAuthForMailer;