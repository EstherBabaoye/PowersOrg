const express = require('express')

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
// const newCollection = require('../database_models/schema')
const register = require('./schema2')

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
    res.send('RESt API auth and authorization')
})

app.post('/api/auth/register', async(req, res) => {

        const {name, email, password, confirmPassword} = req.body
        if(!name || !email || !password || !confirmPassword){
            return res.status(422).json({message: "please fill in all fields (name, email and password)"})
        }

        //to find if the user has email registered already
        const existingUser = await register.findOne({email})

        if(existingUser){
            return res.status(409).json({message: "user already exist"})
        }

        // when password not equal to confirm password
        if(password !== confirmPassword){
            return res.status(400).json({
                message: " Passwords don't match"
            })
        }

        try{
            const hashedPassword = await bcrypt.hash(password, 10);
        const user = new register({
            name,
            email,
            password: hashedPassword
        });
e
        await user.save();
        res.status(201).send({ message: "User created successfully" });
    }   catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error creating user" });
    }
        })

app.listen(5000, () => {console.log("server has started in 3");
}) 