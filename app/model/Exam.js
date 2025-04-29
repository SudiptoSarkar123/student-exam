const mongoose = require('mongoose')
const examSchema = mongoose.Schema({
    name:{type:String,required:true},
    subject:{type:String,requried:true},
    duration:{type:Number,required:true},
    totalMarks:{type:Number,required:true},
    startDate:{type:Date},
    

})


module.exports = mongoose.model('Exam',examSchema)