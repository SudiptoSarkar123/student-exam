
const Admin = require('../model/Admin')
const Student = require('../model/Student')
const Exam = require('../model/Exam')
const Question = require('../model/Question')
const jwt = require('jsonwebtoken')
const { comparePassword, hashPassword, countQuestions } = require('../helper/Auth');
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
            }, process.env.SECRET_KEY, { expiresIn: '120m' })

            res.cookie("authToken", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 120 * 60 * 1000 // 30mins
            })

            return res.redirect(`/admin/adminDash`)


        } catch (error) {

        }
    }

    async listExaminee(req, res) {
        try {
            const students = await Student.find({});
            return res.status(200).json({
                status: true,
                message: 'Students data fetched successfully',
                data: students
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: false,
                message: 'Something went wrong',
            })

        }
    }
    async updateExaminee(req, res) {
        try {
            const { name, gender, email, mobile, } = req.body;
            console.log(req.body)
            if (!name || !gender || !email || !mobile) {
                return res.send('All filds are required')
            }

            const student = await Student.findById(req.params.id);
            if (!student) {

                return res.status(400).json({
                    status: false,
                    message: 'Student not found'
                })
            }

            const updatedStudent = await Student.findByIdAndUpdate(req.params.id, {
                $set: { name, gender, email, mobile }
            })

            if (!updatedStudent) {
                return res.status(400).json({
                    status: false,
                    message: 'Student not found'
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Student updated successfully'
            })



            return res.redirect('/admin/adminDash')

        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async deleteExaminee(req, res) {
        try {
            const { id } = req.params
            const deleteStudent = await Student.findByIdAndDelete(id)
            return res.redirect('/admin/adminDash')
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }


    // Exam Controller

    async getAllExams(req, res) {
        try {
            const exams = await Exam.find({});
            return res.status(200).json({
                status: true,
                message: 'Exams data fetched successfully',
                data: exams
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: false,
                message: 'Something went wrong',
            })

        }
    }

    async getSingleExam(req, res) {
        try {
            const { id } = req.params
            const exam = await Exam.findById(id);
            console.log(exam)
            return res.status(200).json({
                status: true,
                message: 'Exam data fetched successfully',
                data: exam
            })
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                status: false,
                message: 'Failed to fetch exam data',
            })
        }
    }

    async updateExam(req, res) {
        try {
            console.log('inside update exam')
            const id = req.params.id;
            const { name, subject, duration, marksPerQuestion, startDate, endDate } = req.body
            console.log(req.body)

            if (!name || !subject || !duration || !marksPerQuestion || !startDate || !endDate) {
                console.log('all fileds required...')
                return res.status(400).json({
                    status: false,
                    message: 'All fileds are required',
                })
            }

            const exam = await Exam.findById(id)
            if (!exam) {
                console.log('exam not found')
                return res.status(400).json({
                    status: false,
                    message: 'Exam not found...'
                })
            }

            const updateExam = await Exam.findByIdAndUpdate(id, {
                $set: { name, subject, duration, marksPerQuestion, startDate, endDate }
            })
            if (!updateExam) {
                console.log('failed to update exam')
                return res.status(400).json({
                    status: false,
                    message: 'Exam not found...'
                })
            }
            console.log('update successfull')
            return res.status(200).json({
                status: true,
                message: 'Exam updated successfully...'
            })


        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Somthing went worng...'
            })
        }
    }

    async addExams(req, res) {
        const { name, subject, duration, marksPerQuestion, startDate, endDate } = req.body;
        // console.log(req.body)
        if (!name || !subject || !duration || !marksPerQuestion || !startDate || !endDate) {
            return res.status(400).send('All fileds are reqired')
        }
        const data = new Exam({ name, subject, duration, marksPerQuestion, startDate, endDate })
        await data.save()
        return res.redirect('/admin/exam-list')

    }

    async addQuestions(req, res) {
        try {
            const { exam, questionText, options, correctAnswer } = req.body;
            console.log(req.body)
            if (!exam || !questionText || !options || !correctAnswer) {
                return res.status(400).json({ status: false, message: 'All fileds are required...' })
            }
            const examdata = await Exam.findById(exam)

            if (!examdata) return res.status(400).json({ status: false, message: 'Such Exam not exists' })


            const data = new Question({
                exam,
                questionText,
                options,
                correctAnswer,
            })
            await data.save();
            return res.redirect('/admin/question-list');
        } catch (error) {
            console.log(error)
            return res.status(400).json({ status: false, message: 'An error occurred while adding the question.' })
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

    async listExamineePg(req, res) {
        try {
            const users = await Student.find()
            return res.render('./admin/list-examinee', { users })


        } catch (error) {
            console.log(error)
        }
    }

    async getSingleStudent(req, res) {
        try {
            const id = req.params.id;
            const student = await Student.findById(id);

            if (!student) {
                return res.status(400).json({
                    status: false,
                    message: 'Student not found',
                })
            }

            return res.status(200).json({
                status: true,
                message: 'Student data fetched successfully',
                data: student
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong'
            })
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

    async editExamineeForm(req, res) {
        try {
            const { id } = req.params
            const student = await Student.findById(id)
            return res.render('./layouts/editForm', { student })
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async allExamsPg(req, res) {
        try {
            const exams = await Exam.find()
            console.log('all exams')
            return res.render('exam-list', { exams })
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async addExamsPg(req, res) {
        try {
            const exam = await Exam.find()
            return res.render('addExam', { exam })
        } catch (error) {
            console.log(error)
            return res.send(error)
        }
    }

    async QuestionsPg(req, res) {
        try {
            // const questions = await Question.find().populate('exam', 'name')
            return res.render('allQuestions')
        } catch (error) {
            console.log(error)
            return res.status(400).send('failed to show questions ...')
        }
    }

    async allQuestions(req, res) {
        try {
            const allQuestions = await Question.find({}).populate('exam', 'name');

            // Filter out questions where the populated exam is null
            const questions = allQuestions.filter(question => question.exam !== null);
            return res.status(200).json({
                status: true,
                massage: 'Question data fatched successfuly',
                data: questions
            })
        } catch (error) {
            return res.status(400).json({
                status: false,
                massage: 'Question data fatched failed',
            })
        }
    }

    async addQuestionsPg(req, res) {
        try {
            const exams = await Exam.find()
            return res.render('addQuestions', { exams })
        } catch (error) {
            console.log(error)
            res.status(500).send("failed to show questions ...")
        }
    }

    async adminLogout(req,res){
         res.clearCookie("authToken")
        return res.redirect('/admin/login')
    }
}


module.exports = new AdminController()