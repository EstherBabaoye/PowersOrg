  const express = require ('express')
  const path = require('path')
  const bcrypt = require('bcrypt')
  const collection = require("./config")
  const mongoose = require('mongoose')

  const app = express()
//   convert data into json format
app.use(express.json())
app.use(express.urlencoded({extended:false}))

//   providing the ejs
app.set('view engine', 'ejs') 

// static file
app.use(express.static("public"))
app.get('/', (req, res) => {
    res.render("login")
})

app.get('/signup', (req, res ) => {
    res.render("signup")
})

app.post("/signup", async(req, res) => {
    const data ={
        name: req.body.name,
        password : req.body.password
    }

    const userData = await collection.insertMany(data)
    console.log(userData);
    
})
  const port = 8000

  app.listen(port, () => {
     console.log(`server is running on port: ${port}`);  
  })