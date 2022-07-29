const mongoose = require('mongoose');
const STATES = require("../base/states");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email:{
        type:String,
    },
    mobile:{
        type:String,
        required:false,
    },
    activated:{
        type:Boolean,
        default:false,
    },
    name:{
        type:String,
        minlength:["2" , "Name is invalid"],
        maxlenght:["25" , "Name is invalid"]
    },
    avtaar:{
        type:String,
        default:null
    },
    followings:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Useraccount"
        }
    ],
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Useraccount"
        }
    ],

    description:{
        type:String,
        default:"Hey, i'm curious about technologies let's talk about it."
    },

    date:{
        type:Date,
        default: Date.now
    },

    categories:[
        {
            type:String,
            enum:STATES.category_enum_array,
            validate:(value)=>{
                if(!STATES.category_enum_array.includes(value)){
                    throw new Error("Your selected category haven't listed yet");
                }
            }
        }
    ],
    token:{
        type:String,
        default:null
    },
    deactivated:{
        reason:{
            type:String,
            minlength:[30 , "Reason should be at least 30 characters or more"],
            maxlength:[500 , "Reason exceed the limit"]
        },
        status:{
            type:Boolean,
            default:false
        }
    }
},{
    timestamps:true
});

// creating model
module.exports = mongoose.model("Useraccount" , UserSchema);