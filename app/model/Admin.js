const mongoose = require('mongoose')
const adminSchema = mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    role:{type:String,default:'admin'},
})

module.exports = mongoose.model('admin',adminSchema)
