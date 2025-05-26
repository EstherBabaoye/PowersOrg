const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required:true,
        unique: true
    },

    password: {
        type:String,
        required: true
    },

    OTP: {
        type: {type:String,}
    },
    otpExpiry:{
        type: Date
    },

    isVerified:{
        type: Boolean, 
        default:false}
    })

const User = new mongoose.model('User', clientSchema)

module.exports = User