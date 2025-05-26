const mongoose = require ('mongoose')

// connecting to database
const connect = mongoose.connect("mongodb://localhost:27017/myGoals")

connect.then(() => {
    console.log('database sucessfully connected');
})
.catch((err) => {
    console.log("database not connected", err);
})

// creating a schema 

const RegSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, "input your name!"]
    },

    password: {
        type:String,
        required: [true, "Password is required!"],
        trim: true,
        select: false
    },
    
     email: {
        type: String,
        required: [true, "Email is required!"],
        unique: [true, "Email must be unique!"],
        lowercase: true,
        minLength: [5, " minimum of 5 characters"]
    }
})

const register = new mongoose.model("User", RegSchema)

module.exports = register