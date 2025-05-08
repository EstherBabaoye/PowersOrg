const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({extended:false}))

app.post('/about',(req,res, next) => {
     res.send('<h1> user:' + req.body.userName + ' </h1>')
})


app.get('/',(req, res, next) => { //action there is because it indicates where the result will be posted to
    res.send('<form action="/about" method = "POST"><input type= "text" name = "userName"><button type = "submit" >create user</button></form>')
})
app.listen(5000)