const bcrypt = require('bcryptjs')
const Question = require('../model/Question')
const mongoose = require('mongoose')

const comparePassword = (password,hash)=>{
    return bcrypt.compareSync(password,hash)
}

const  hashPassword = (password)=>{
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password,salt)
    return hash
}

const countQuestions = async (examId)=>{
    const result = await  Question.aggregate([
        {$match:{exam: new mongoose.Types.ObjectId(examId )}
    },{
        $group:{
        _id:'$examId',
        totalQuestions:{$sum:1}
        }
    }
    ])
    if(result.length > 0){
        return result[0].totalQuestions
    }else{
        return 1;
    }
}

module.exports = {comparePassword,hashPassword,countQuestions}