const mongoose = require('mongoose')

const resultSchema = mongoose.Schema({
    student:{type:mongoose.Schema.Types.ObjectId, ref:'Student',required:true},
    exam:{type:mongoose.Schema.Types.ObjectId,ref:'Exam',required:true},
    score:{type:Number,required:true},
    submissionDate:{type:Date,default:Date.now},
    answers:[{
        question:{type:mongoose.Schema.Types.ObjectId,ref:'Question',required:true},
        isCorrect:Boolean,
        selectedAnswer:String,
        correctAnswer:String
    }],
    unanswered:{type:Number,default:0}
},{timestamps:true})

module.exports = mongoose.model('result',resultSchema)