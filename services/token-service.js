const jwtToken = require("jsonwebtoken");
const STATES = require("../base/states");
const accessTokenSecret = process.env.ACCESSTOKENSECRET;
const refreshTokenSecret = process.env.REFRESHTOKENSECRET;
const userModel = require('../models/user-model');

class Token_Services {

    // this function will use to create access adn refresh token simultaneusly with using given payload
    Tokens(payload) {
        // creating accessToken with will expire within 1h
        const accessToken = jwtToken.sign(payload, accessTokenSecret, {
            expiresIn: STATES.small_expiry // 1day
        });

        // creating refreshtoken which will automatically expire wtihin 30 days
        const refreshToken = jwtToken.sign(payload, refreshTokenSecret, {
            expiresIn: STATES.long_expiry // 7days
        });

        // returning both tokens 
        return { accessToken, refreshToken };
    }

    // this is an asynchronus function to store and update refreshToken according to the condition in database 
    async setToken(token, userId) {
        try {
            return await userModel.findByIdAndUpdate(userId, { $set: { token } });
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    // this function will be used to reverse accessToken
    async reverseAccessToken(token ){
        return await jwtToken.verify(token , accessTokenSecret);
    }

    // this function will be used to reverse refreshToken
    async reverseRefreshToken(token){
        return await jwtToken.verify(token , refreshTokenSecret);
    }

    // this function will be used to find the token from the database
    async findTokenInDB(_id , token){
        return await userModel.findOne({_id , token});
    }

    async removeToken(_id , token){
        const deleteToken = await userModel.findOne({_id , token});

        deleteToken.token = null;
        await deleteToken.save();

        return deleteToken;
    }
}

module.exports = new Token_Services();