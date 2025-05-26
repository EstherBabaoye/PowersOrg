 const mongoose = require ('mongoose')
 const newPostSchema = mongoose.Schema({
    title:{
        type: String,
        required: [true, 'title is required'],
        trim: true
    },

    description: {
        type: String,
        required: [true, 'title is required'],
        trim: true
    },

// storing the user id
    userId:{
        type: mongoose.Schema.Types.ObjectId,
    }, 
 },{timestamps:true})

 module.exports = mongoose.model('Post', newPostSchema)