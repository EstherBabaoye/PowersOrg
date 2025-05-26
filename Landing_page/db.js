const mongoose = require('mongoose')

const User = require('./middleware/models/myUsers')

const MONGO_URI = ""

// connect to database
const dbConnection = async() => {
    try{
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        console.log('Database connected successfully')

        // making an empty user collection
        await User.creatCollection()
        console.log("User collection is created");
        } 
        catch(error) {
            console.error("database connection failed")
        }
}

dbConnection()

module.exports = dbConnection