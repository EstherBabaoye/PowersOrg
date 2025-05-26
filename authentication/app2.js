const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const app = express()

app.use(express.static(''))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render("home")
})

app.get("/signUp", (req, res) => {
    res.render("secret")
})

app.listen(5000, () => {
    console.log("server has started")
})