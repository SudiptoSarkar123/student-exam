const mongoose = require('mongoose')
const examSchema = mongoose.Schema({
    name:{type:String,required:true},
    subject:{type:String,requried:true},
    duration:{type:Number,required:true},
    marksPerQuestion:{type:Number,required:true},
    startDate:{type:Date},
    endDate:{type:Date}
    

})


module.exports = mongoose.model('Exam',examSchema)