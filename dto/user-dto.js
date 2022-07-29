class USERDTO{
    constructor(user){
        this._id = user._id,
        this.name = user.name,
        this.email = user.email,
        this.mobile = user.mobile,
        this.avtaar = user.avtaar?process.env.BASE_URL+user.avtaar:user.avtaar,
        this.activated = user.activated,
        this.follwings = user.followings.length||0,
        this.followers = user.followers.length||0,
        this.description = user.description,
        this.categories = user.categories
    }
};

module.exports = USERDTO;