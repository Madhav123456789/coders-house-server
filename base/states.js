// for choosing categories
const CATEGORIES = ["Technology" , "Music" , "Science" , "Nature" , "Spritual" , "Artificial Intelligence" , "Machine Learning", "Others"];

// for register complaint
const COMPLAINT_REASON_TYPE=["Report a user" , "Related Account deletion" , "Realated my account" , "Report a bug" , "Report a room" , "Related room" , "Reactivate my account"];

const STATIC_STATES = {
    // 1 minute
    otp_expiry :1000 * 60 * 1,
    // 2 mintues
    otp_expiry_long : 1000*60*2,
    // 1 day
    small_expiry : 1000 * 60 * 60 * 24,
    // 7 days
    long_expiry : 1000 * 60 * 60 * 24 * 7,
    // category array
    category_enum_array : CATEGORIES,
}

module.exports = STATIC_STATES;