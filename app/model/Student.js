const mongoose = require('mongoose')
const studentSchema =new mongoose.Schema({
    name:{type:String,required:true},
    gender:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    mobile:{type:String,required:true},
    result:{type:mongoose.Schema.Types.ObjectId,ref:'result',required:false},
    password:{type:String,required:true},
    completedExams:[{type:mongoose.Schema.Types.ObjectId,ref:'Exam'}]
},{timestamps:true})


module.exports = mongoose.model('Student',studentSchema)