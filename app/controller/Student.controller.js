
const Student = require('../model/Student')
const { comparePassword, hashPassword } = require('../helper/Auth')
const jwt = require('jsonwebtoken')
class studentController {
    async studentRegister(req, res) {
        try {
            const { name, gender, email,subject, mobile, password, confirmPassword } = req.body ;
            console.log(req.body)
            if (!name || !gender || !email || !mobile || !password || !confirmPassword) {
                console.log('All filds are required')
                return res.send('All filds are required ')
            }
            const student = await Student.findOne({ email })
            if (student) {
                return res.send('user alrady exists ')
            } 

            if (password !== confirmPassword  ) {
                return res.send('Filds are not matching')
            }

            const passwordHash = hashPassword(password)

            const data = new Student({ name, gender, email,subject, mobile, password: passwordHash })
            await data.save()
            return res.redirect('/student/login')
        } catch (error) {
            console.log(error)
            return res.send('something went wrong')
        }
    }

    async studentLogin(req, res) {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.send('All filds are required')
            }
            const student = await Student.findOne({ email })
            if (!student) {
                return res.send('user not found')
            }
            const isMatch = comparePassword(password, student.password)
            if (!isMatch) {
                return res.send('password not matching')
            }
            const token = jwt.sign({
                _id: student._id,
                email: student.email,
            },process.env.SECRET_KEY,{expiresIn:'30m'}) 
            res.cookie("authToken", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 30 * 60 * 1000 // 30mins
            })
            return res.redirect('/student/dashboard')

        } catch (error) {
            console.log(error)
            return res.send('something went wrong')

        }
    }

    // Static methods

    async studentLoginPg(req, res) {
        try {
            return res.render('studentLogin')
        } catch (error) {
            console.log(error)
        }
    }
    async studentRegisterPg(req, res) {
        try {
            return res.render('studentRegister')
        } catch (error) {
            console.log(error)
        }
    }
}


module.exports = new studentController()