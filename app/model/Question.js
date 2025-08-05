const mongoose = require('mongoose')

const questionSchema = mongoose.Schema({
    exam:{type:mongoose.Schema.Types.ObjectId,ref:'Exam',required:true},
    questionText:{type:String,required:true},
    options:[{type:String}],
    correctAnswer:{type:String},
    marks:{type:Number,default:1}
},{timestamps:true})




module.exports = mongoose.model('Question',questionSchema)
