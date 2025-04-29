
const Admin = require('../model/Admin')
const Student = require('../model/Student')
const Exam = require('../model/Exam')
const Question = require('../model/Question')
const jwt = require('jsonwebtoken')
const { comparePassword, hashPassword ,countQuestions} = require('../helper/Auth');
const flash = require('connect-flash');
class AdminController {
    async adminLogin(req, res) {
        try {

            const { email, password } = req.body;
            if (!email || !password) {
                return res.send('All filds are required...')
            }
            const admin = await Admin.findOne({ email })
            if (!admin) return res.send('Admin is not exists');

            const token = jwt.sign({
                _id: admin._id,
                name: admin.name,
                email: admin.email
            }, process.env.SECRET_KEY, { expiresIn: '30m' })

            res.cookie("authToken", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 30 * 60 * 1000 // 30mins
            })

            return res.redirect(`/admin/adminDash`)


        } catch (error) {

        }
    }

    async editExaminee(req, res) {
        try {
            const {name,gender,email,subject,mobile,} = req.body;
            console.log(req.body)
            if(!name || !gender || !email || !subject || !mobile){
                return res.send('All filds are required')
            }
            const findById = await Student.findOneAndUpdate({_id:req.params.id},{
                $set:{name,gender,email,subject,mobile}
            })
            
            return res.redirect('/admin/adminDash')

        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async deleteExaminee(req, res) {
        try {
            const {id} = req.params
            const deleteStudent = await Student.findByIdAndDelete(id)
            return res.redirect('/admin/adminDash')
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async addExams(req,res){
        const {name,subject,duration,totalMarks,startDate } = req.body ;
        // console.log(req.body)
        if(!name || !subject || !duration || !totalMarks || !startDate){
            return res.status(400).send('All fileds are reqired')
        }
        const data = new Exam({name,subject,duration,totalMarks,startDate})
        await data.save()
        return res.redirect('/admin/adminDash')

    }

    async addQuestions(req,res){
        try {
            const {exam,questionText,options,correctAnswer} = req.body;
            console.log(req.body)
            if(!exam||!questionText||!options||!correctAnswer){
                return res.status(400).send('All fileds are reqired')
            }
            const examdata = await Exam.findById(exam)
            const totalQuestions = await countQuestions(exam);
            console.log(totalQuestions)
            if(totalQuestions === 0){
                return res.status(400).send('No questions assigned to this exam yet.')
            }
            const marksParQuestion = examdata.totalMarks / totalQuestions ;
            const data = new Question({
                exam,
                questionText,
                options,
                correctAnswer,
                marks:marksParQuestion
            })
            await data.save();
            return res.redirect('/admin/adminDash');
        } catch (error) {
            console.log(error)
            return res.status(500).send('An error occurred while adding the question.');
        }
    }






    // Static methods
    async adminLoginPg(req, res) {
        try {
            return res.render('adminLogin')

        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }
    async adminDash(req, res) {
        try {
            console.log(req.user)
           
            const user = await Admin.findById(req.user._id)
            console.log(user)
            const users = await Admin.find()
            return res.render('adminDash', { user, users })

        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async listExaminee(req, res) {
        try {
            const users = await Student.find()
            return res.render('./layouts/list-examinee', { users })


        } catch (error) {
            console.log(error)
        }
    }

    async editExamineePg(req, res) {
        try {
            const users = await Student.find()
            return res.render('./layouts/editStudents', { users })
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async editExamineeForm(req,res){
        try {
            const {id} = req.params
            const student = await Student.findById(id)
            return res.render('./layouts/editForm',{student})
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async allExams(req,res){
        try {
            const exams = await Exam.find()
        return res.render('exam-list',{exams})
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async addExamsPg(req,res){
        try {
            const exam = await Exam.find()
            return res.render('addExam',{exam})
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async allQuestions(req,res){
        try {
            const questions = await Question.find().populate('exam','name')
            return res.render('allQuestions',{questions})
        } catch (error) {
            console.log(error)
            return res.status(400).send('failed to show questions ...')
        }
    }

    async addQuestionsPg(req,res){
        try {
            const exams = await Exam.find()
            return res.render('addQuestions',{exams})
        } catch (error) {
            console.log(error)
            res.status(500).send("failed to show questions ...")
        }
    }
}


module.exports = new AdminController()