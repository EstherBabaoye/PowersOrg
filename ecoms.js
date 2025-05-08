const express = require('express')
// const path = require ('path')
const bcrypt = require ('bcrypt')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const newCollection = require('./../new node/database_models/schema')
const { default: mongoose } = require('mongoose')

const app = express()

// convert data into json format
app.use(cors({
    origin: ['http://localhost:27017'],
    methods: ["GET", "POST"],
    credentials: true
}))
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(newCollection)

app.use(express.urlencoded({extended:true}))

mongoose.connect("mongodb://localhost:27017/myGoals")

// app.use('/api/auth', authrouter)
app.get('/SignIn', (req, res) => {
    res.render('SignIn')
})

app.post('./SignIn', async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
    }

    const userData = await collection.insertMany(data)
    console.log(userData);
})

app.get('./SignUp', (req, res) => {
    res.render("SignUp")
})

app.post('./SignUp', async (req, res) => {
    const data1 = {
        name: req.body.name,
        password: req.body.password,
        confirmPassword: req.body.password,
        email: req.body.email,
    }
    if (password !== confirmPassword) {
        return res.send({
            status: "failed",
            message: "Incorrect password!"
        })
    }
} )

app.post('/forgotPassword', (req, res) => {
    const {email} = req.body
    newCollection.findOne({email:email})
    .then(users => {
        if(!users){
            return res.send({
                status: 'failed',
                message: "user does not exist "
            })
        }
    })
})

app.listen(5000, () => {
    console.log('succesful');
})