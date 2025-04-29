const mongoose = require('mongoose')

const resultSchema = mongoose.Schema({
    student:{type:mongoose.Schema.Types.ObjectId, ref:'Student',required:true},
    exam:{tyep:mongoose.Schema.Types.ObjectId,ref:'Exam',required:true},
    score:{type:String,required:true},
    totalMarks:{type:String,required:true},
    submissionDate:{type:Date,default:Date.now},
    answers:[{
        question:{type:mongoose.Schema.Types.ObjectId,ref:'Question',required:true},
        selectedAnswer:String,
        isCorrect:Boolean
    }]

},{timestamps:true})

module.exports = mongoose.model('result',resultSchema)