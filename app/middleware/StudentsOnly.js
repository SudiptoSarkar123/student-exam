const jwt = require('jsonwebtoken')
const Student = require('../model/Student')



const StudentsOnly = async (req,res,next)=>{
    try {
        const token = req.headers['authToken'] || req.cookies.authToken ;
        if(!token) return res.redirect('/student/login',{message:'Unauthorised: No token provided'});

        const decode = jwt.verify(token,process.env.SECRET_KEY);
        const user = await Student.findOne({_id:decode._id})
        if(!user)return res.redirect('/student/login')
        
        req.user = {
            _id: user._id            
        }

        next()

    } catch (error) {
        console.log(error)
        return res.redirect('/student/login')
    }
}


module.exports = {StudentsOnly}