const jwt = require('jsonwebtoken')
const Admin = require('../model/Admin')



const AdminsOnly = async (req,res,next)=>{
    try {
        const token = req.headers['authToken'] || req.cookies.authToken ;
        if(!token) return res.redirect('/admin/login',{message:'Unauthorised: No token provided'});

        const decode = jwt.verify(token,process.env.SECRET_KEY);
        const user = await Admin.findOne({_id:decode._id})
        if(!user)return res.redirect('/admin/login');
        
        req.user = {
            _id: user._id,
            role: user.role
        }

        next()

    } catch (error) {
        console.log(error)
        return res.redirect('/admin/login')
    }
}

module.exports = {AdminsOnly}