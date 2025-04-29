const mongoose = require('mongoose')
const studentSchema = mongoose.Schema({
    name:{type:String,required:true},
    gender:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    mobile:{type:Number,required:true,unique:true},
    result:{type:mongoose.Schema.Types.ObjectId,ref:'result',required:false},
    password:{type:String,required:true}
},{timestamps:true})


module.exports = mongoose.model('Student',studentSchema)