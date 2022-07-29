const Otp = require("otp-process");
const { sendOtpEmail, sendEmail } = require("../services/email-service");
const ResponseHandler = require("../utils/ResponseHandler");
let Response = new ResponseHandler(400);
const userModel = require("../models/user-model");
const STATES = require("../base/states");
const tokenService = require("../services/token-service");
const userDto = require("../dto/user-dto");
const jimp = require("jimp");
const path = require("path");
const MAIL = require("../base/mail");
const validator = require("validator");

class UserController {
  // for sending signup otp
  async sendOtp(req, res) {
    Response.reset(res);

    // destructuring the body
    const { email, mobile } = req.body;

    // validation
    if (!email && !mobile) {
      return Response.NeedError("Email or Mobile required");
    } else if (email && (!validator.isEmail(email) || email.length < 8)) {
      return Response.NeedError("Please enter a valid email");
    } else if (mobile && !validator.isMobilePhone(mobile, ["en-IN"])) {
      return Response.NeedError("Enter a valid number");
    }

    // creating otp
    const otp = Otp.createOtp(
      4,
      email ? { email } : { mobile },
      2,
      process.env.OTP_SECRET
    );

    // cheking where to send otp
    // if user requested with email
    if (email) {
      // validating otp
      if (otp.error) {
        return Response.NeedError(otp.error);
      }

      const isUser = await userModel.findOne({ email });

      // checking if user deactivated
      if (isUser && isUser.deactivated.status === true) {
        // send email
        sendEmail(
          isUser.email,
          MAIL(isUser.name || null, isUser.email),
          "You are trying to login"
        );
        return Response.NeedError("Access denied! account disabled", 403);
      }

      if (isUser) {
        sendOtpEmail(email, otp.otp, "login into Coder's House");
      } else {
        sendOtpEmail(email, otp.otp, "signup into Coder's House");
      }
    }
    // if user requested with mobile
    else if (mobile) {
      // validating otp
      if (otp.error) {
        return Response.NeedError(otp.error);
      }

      // sent otp to mobile but here i am consoling the otp
      console.log(otp.otp);
    }

    // sending response
    return Response.NeedExec("Otp sent successfully", {
      hash: otp.hash,
      data: otp.data,
    });
  };

  // verify otp and create user account
  async verifyOtp(req, res) {
    Response.reset(res, 400);
    // destructuring data
    const { hash, data, otp } = req.body;

    // validating
    if (!hash || !data || !otp) {
      return Response.NeedError("All fields are required");
    }

    // verifying otp
    const isVerify = Otp.verify(hash, data, otp, process.env.OTP_SECRET);

    if (isVerify.error) {
      return Response.NeedError(isVerify.error);
    }

    // now user verified you can also verify one more time by the code given below

    if (isVerify.flag) {
      console.log(isVerify.flag);
      // creating user to the database
      let user;
      Response.setStatus(500);
      const IS = {
        created:false
      }

      try {
        // checking is user already exist
        user = await userModel.findOne(
          isVerify.data.email ? { email: data.email } : { mobile: data.mobile }
        );

        if (user && user.deactivated.status === true) {
          // send email
          sendEmail(
            isUser.email,
            MAIL(isUser.name || null, isUser.email),
            "You are trying to login"
          );
          return Response.NeedError("Access denied! account disabled", 403);
        }

        if (!user) {
          IS.created = true;
          // creating a user
          user = await userModel(
            isVerify.data.email
              ? { email: data.email }
              : { mobile: data.mobile }
          ).save();

          if (!user) {
            return Response.NeedError("User registration failed");
          }
        }
      } catch (error) {
        return Response.NeedError(error);
      }

      // Creating payload for tokens
      const payload = {
        user: user._id,
      };

      // Tokens
      const { accessToken, refreshToken } = tokenService.Tokens(payload);
      // storing user's refresh token to the database
      const store = await tokenService.setToken(refreshToken, user._id);

      if (!store) {
        return Response.NeedError("Some technical issue occured");
      }

      // setting cookies
      res.cookie("refreshToken", refreshToken, {
        maxAge: STATES.long_expiry,
        httpOnly: true,
      });

      res.cookie("accessToken", accessToken, {
        maxAge: STATES.small_expiry,
        httpOnly: true,
      });

      Response.NeedExec(`${IS.created?"Your account created successfully":"You have been logged in successfully"}`, {
        user: new userDto(user),
      });
    }
  };

  // activating user
  async activate(req, res) {
    Response.reset(res, 400);

    const _id = req._id;

    // destructuring data
    const { name, avtaar } = req.body;

    //validation
    if (!name || name.length < 2) {
      return Response.NeedError("Invalid name");
    }

    // finding user
    const user = await userModel.findById(req._id);

    if (!avtaar) {
      // activating account
      user.name = name;
      user.activated = true;
      await user.save();
    } else {
      // Image Base64
      const buffer = Buffer.from(
        avtaar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      const imagePath = `${_id}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.png`;

      try {
        const jimResp = await jimp.read(buffer);
        // checking, Is profile pic already exist?
        if (!user.avtaar) {
          jimResp
            .resize(200, jimp.AUTO)
            .write(path.resolve(__dirname, `../data/${imagePath}`));
        } else {
          const splits = user.avtaar.split("/");
          require("fs").unlink("./data/" + splits[splits.length - 1], (err) => {
            if (!err) {
              jimResp
                .resize(200, jimp.AUTO)
                .write(path.resolve(__dirname, `../data/${imagePath}`));
            } else {
              return Response.NeedError("Some technical issue occured");
            }
          });
        }
      } catch (err) {
        return Response.NeedError("Could not process the image", 500);
      }

      // updating
      user.avtaar = `/data/${imagePath}`;
      user.name = name;
      user.activated = true;
      await user.save();
    }

    return Response.NeedExec("Account activation successfull", {
      user: new userDto(user),
    });
  };

  // for logout
  async getLoggedOut(req, res) {
    Response.reset(res , 400);
    // this is user id
    const _id = req._id;

    // getting refresh token of the user from cookies
    const { refreshToken } = req.cookies;

    if(!refreshToken) return;

    try {
      // removing the refresh token from the database
      const removeToken = await tokenService.removeToken(_id, refreshToken);
      // if not found and deleted then throw error
      if (!removeToken) {
        return Response.NeedError("User Couldn't Logged Out", 404);
      }
    } catch (error) {
      return Response.NeedError(error.message , 500);
    }

    // now clearing the token from the user cookies
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    Response.NeedExec(`Signed Out Completed`);
  };

  // refresh token
  // this function will be used to refresh auth token
  async getRefressAuth(req, res) {
    Response.reset(res , 400);

    // get refresh token from the cookie 
    const { refreshToken: token } = req.cookies;

    if (!token) {
        return Response.NeedError("Refresh token not available");
    }

    // checking is refresh token is valid or not 
    let userData;
    try {
        userData = await tokenService.reverseRefreshToken(token);

        if (!userData) {
            return Response.NeedError("Token is invalid please re-login or create an account");
        }
    } catch (error) {
        return Response.NeedError(error.message, 500);
    }

    // checking is token present in the db with the same user 
    let is_Token_In_DB;
    // console.log(userData)
    const userId = userData.user;

    try {
        is_Token_In_DB = await tokenService.findTokenInDB(userId, token);

        if (!is_Token_In_DB) {
            return Response.NeedError("Not found", 404);
        }

    } catch (error) {
        return Response.NeedError("Some Server Error Occured", 500);
    }

    // Now cheking is user valid or not which is present as token's userid
    let isUser;
    try {

        isUser = await userModel.findById(userId).limit(1);

        if (!isUser) {
            return Response.NeedError("User Invalid");
        }

    } catch (error) {
        return Response.NeedError("Some Technical issue Occured", 500);
    }

    // Creating payload for tokens 
    const payload = {
        user: isUser._id,
    };

    //Generating new tokens
    const { refreshToken, accessToken } = tokenService.Tokens(payload);

    // setting new refreshToken to the database 
    try {
        const setToken = await tokenService.setToken(refreshToken, userId);

        if (!setToken) {
            return Response.NeedError("Some Technical issue Occured", 500);
        }
    } catch (error) {
        return Response.NeedError("Some Technical issue Occured", 500);
    }

    // setting the tokens in cookies
    // setting cookies
    // setting cookies
    res.cookie('refreshToken', refreshToken, {
        maxAge: STATES.long_expiry,
        httpOnly: true,
    });

    res.cookie('accessToken', accessToken, {
        maxAge: STATES.small_expiry,
        httpOnly: true,
    });

    Response.NeedExec(null, {
        user: new userDto(isUser)
    });
};

  // change profile picture
  async changeAvtaar(req , res){
    Response.reset(res);

    // destructuring data
    const {avtaar} = req.body;

    // validation

    if(!avtaar) return Response.NeedError("Field is empty");

    const buffer = Buffer.
    from(avtaar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),"base64");

    // creating path
    const imagePath = `${_id}-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

    // user
    let user;
    try {
      // finding user from the database
      user = await userModel.findById(req._id);

      // reading buffer using jimp package
      const jimResp = await jimp.read(buffer);
      // checking, Is profile pic already exist?
      if (!user.avtaar) {
        jimResp
          .resize(200, jimp.AUTO)
          .write(path.resolve(__dirname, `../data/${imagePath}`));
      } else {
        const splits = user.avtaar.split("/");
        require("fs").unlink("./data/" + splits[splits.length - 1], (err) => {
          if (!err) {
            jimResp
              .resize(200, jimp.AUTO)
              .write(path.resolve(__dirname, `../data/${imagePath}`));
          } else {
            return Response.NeedError("Some technical issue occured");
          }
        });
      }
    } catch (err) {
      return Response.NeedError("Could not process the image", 500);
    };

    // saving the image path to the database
    user.avtaar = `/data/${imagePath}`;
    const newUser = await user.save();

    Response.NeedExec("Your avtaar has been updated successfully" , {
      avtaar:newUser.avtaar
    })
  }

  // deactivating account
  async deactivate(req, res) {
    Response.reset(res);

    // finding user
    const user = await userModel.findById(req._id);

    // raising a complaint
  }
}

module.exports = new UserController();