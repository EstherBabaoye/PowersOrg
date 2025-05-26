const express = require('express')
const bcrypt = require ('bcrypt')
const cors = require('cors') 
const nodemailer = require('nodemailer')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const newCollection = require('./../new node/database_models/schema')
const forgotPassword = require('./forgotPassword')
const jwt = require('jsonwebtoken')
const register = require('./REst_api_auth/schema2')
const Collection = require('./src/config')

const router = express.Router()

const app = express()

// convert data into json format
app.use(cors({
    origin: ['http://localhost:27017'],
    methods: ["GET", "POST"],
    credentials: true
}))
// app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(newCollection)

app.use(express.urlencoded({extended:true}))

// mongoose.connect("mongodb://localhost:27017/myGoals")
 

router.post('/login', (req,res) => {
    res.render('login')
    const user = {
        id:1,
        username: 'username'
    }
    const token = jwt.sign(user, SECRET_KEY, {expiresIn: '1h'})
})
router.get('/SignIn', (req, res) => {
    res.end("SignIn")
})

router.post('/SignIn', async (req, res) => {
    const {email, password} = req.body

    // to find user by email

    const user = await Collection.findOne({ email });

    if(!user){ 
        return res.status(400).json({message:'Invalid email or password'})
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    // to check if the password is the right password

    const checkPassword = await bcrypt.compare(password, user.password)
    
    if(!checkPassword){
        return res.status(400).json({
            message: 'invalid email or password'
        })
    }

    // jwt token
    const token = jwt.sign({userId: user._id}, "your token", {
        expiresIn:'1h'
    })
    res.json({message:'sign in successful', token})

    const userData = await Collection.insertMany(data)
    console.log(userData);
})

router.get('/SignUp', (req, res) => {
    res.render("SignUp")
})

router.post('/SignUp', async (req, res) => {
    const{name, email, password} = req.body
    if (!name || !email || !password) {
        return res.send({
            status: "failed",
            message: "Name, email and password required!"
        })
    }

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new register({name, email, password:hashedPassword})
        await user.save()
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    const SignUpDetails = await Collection.insertMany(data1)
    console.log(SignUpDetails);
    })

router.get('/forgotPasswod', (req, res) => {
    res.render("forgotPassword")
})

router.post('/forgotPassword', (req, res) => {
    const {email} = req.body
    forgotPassword.findOne({email:email})
    .then(users => {
        if(!users){
            return res.send({
                status: 'failed',
                message: "user does not exist "
            })
        }
        const token = jwt.sign({id: users._id},"jwt_secret_keys", 15)

        // sending email with nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'youremail@gmail.com',
              pass: 'yourpassword'
            }
          });

        //   configuring the mailOptions
          
          const mailOptions = {
            from: 'youremail@gmail.com',
            to: 'myfriend@yahoo.com',
            subject: 'Reset your password',
            text: 'Done!'
          };

        //   send the email
          
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              return res.send({status: "success"});
            }
          });
    })
})

// Resend email
// const resend = Resend(process.env.RESEND_API_KEY)

app.listen(5000, () => {
    console.log('succesful')})