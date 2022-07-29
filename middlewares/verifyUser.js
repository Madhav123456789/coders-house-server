const UserModel = require('../models/user-model');
const tokenServices = require('../services/token-service');
const ResponseHandler = require('../utils/ResponseHandler');

const verifyUser = async (req, res, next) => {
    // initializing response handler
    const Response = new ResponseHandler(401 , res);
    try {
        const {accessToken} = req.cookies;
        // console.log(accessToken);

        if(!accessToken){
            return Response.NeedError("Access denied! May accesstoken token expired");
        }

        const user = await tokenServices.reverseAccessToken(accessToken);

        // console.log(user)

        if(!user){
            return Response.NeedError("Access denied! May accesstoken token expired");
        }

        const isUserInDB = await UserModel.findOne({_id : user.user});

        if(!isUserInDB){
            return Response.NeedError("" , 404);
        };

        if(isUserInDB.deactivated.status === true){
            return Response.NeedError("Access denied! account deactivated" , 403);
        };

        req._id = user.user;

        next();
    } catch (error) {
        return Response.NeedError(error.message);
    }

    
}

module.exports = verifyUser;