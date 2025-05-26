const express = require('express')
 
const dbConnection = require('./Landing_page/db')

dbConnection()

const app = express()

app.use(express.json())

const PORT = 8000
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})