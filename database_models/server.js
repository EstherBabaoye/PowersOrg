const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(express.json())

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.get('/nice', (req, res) => {
    console.log(req.header);
    res.send('ghost')
})
app.get('/:id', (req, res) => {
    console.log(req.params);
    res.send("cold")
    
})
app.get("/r/:name/:age", (req, res) => {
    console.log(req.params);
    res.send('all day long')
    
})

app.get('/', (req, res) => {
   console.log(req.query);
    res.send('mood')
})

app.post('/profile', (req, res) => {
    console.log(req.body);
    
    const users = {
        name: "usen mj",
        hobby: "prophecy"
    }
    res.send(users)
})
app.post('/profiled', (req, res) => {
    console.log(req.body);
    
    const used = {
        name: "usen tomi",
        hobby: "prophecy"
    }
    res.send(used)
})

app.listen(3000, () => {
    console.log("gidigbo");
    
})