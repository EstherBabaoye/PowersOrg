 const User = require('../middleware/models/myUsers')

 const nodeMailer = require('nodemailer')
 const crypto = require('crypto')

//Transporting of the Email

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: "joshuakolawole19@gmail.com",
        pass:"joshuakolawole1234"
    }
})

// genetrating OTP 

const OTP = () => crypto.randomInt (100000, 999999).toString()

// Register user and send OTP

const register = async (req, res) => {
    try{
        const {name, email, password} = req.body
        let user = await User.findOne({email})

        if (user) return res.status(400).json({
            message: "user already has an account"
        })

        const OTP = OTP()
        const otpExp = new Date(Date.now() + 10 * 60 * 1000)

        //  new user
        user = new User({name, email, password, OTP, otpExp})
        await user.save()

        await transporter.sendMail({
            from: 'everyon21@gmail.com',
            to : email,
            subject: 'OTP verification',
            text: `OTP code is ${OTP}`
        })
        res.status(201).json({message: 'user registered, Pls check your mail for OTP verification'})
    } catch (err){
        res.status(500).json ({message: 'Error resgistring user', err})
    }
}

// otp verification

const verifyOTP = async (req, res) => {
    try{
        const {email, OTP} = req.body
        const user = await User.findOne({email})

        if (!user) return res.status(400).json({message: "user not found"})
        if (user.isVerified) return res.status(400).json({message:"user already verified"})
        
        if(user.OTP !== OTP || user.otpExp > new Date()){
            return res.status(400).json({message:" expired OTP"})
        }
        user.isVerified = true
        user.OTP = undefined
        user.otpExp = undefined
        await user.save()

        res.json({message:"Email successfully verified"})
    } catch (err) {
        return res.status(500).json({message: "Error verifying OTP", err})
    }

}
// to resend the OTP code

const resendOTP = async(req, res) => {
    try{
        const {email} = req.body
        const user = await User.findOne({email})

        if (!user) return res.status(400).json({message:"user does not exist"})
        if(user.isVerified) return res.status(400).json({message: "User already verified"})
        
        const otp = generateOTP()
        user.OTP = otp
        user.otpExp = new Date(Date.now() + 10 * 60 * 1000)
        await user.save()

        await transporter.sendMail({
            from: 'everyon21@gmail.com',
            to : email,
            subject: 'OTP verification',
            text: `OTP code is ${OTP}`
        })
        res.json({message:" OTP resent successfully"})
        
    } catch (err){
        res.status(500).json({message:"error resending OTP", err})
    }
}

module.exports = {verifyOTP, register, resendOTP}