const mongoose = require("mongoose");


const imageSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        max:20,
        required:true
    },

    slug:{
        type:String,
        trim:true,
        max:32,
        required:true,
        max:32,
        unique:true,
        lowercase:true,
        index:true
    },

    image:{
        url:String,
        key:String
    },
    content:{
        type:{},
        min:10,
        max:2000000
    },
    postedBy:{
        type:Object,
        ref:'User'
    }
},{timestamps:true})

module.exports=mongoose.model('ImageUpload',imageSchema)