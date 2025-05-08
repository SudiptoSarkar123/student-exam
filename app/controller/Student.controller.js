
const Student = require('../model/Student')
const { comparePassword, hashPassword } = require('../helper/Auth')
const Exam = require('../model/Exam')
const jwt = require('jsonwebtoken');
const Question = require('../model/Question');
const Result = require('../model/Result');
class studentController {
    async studentRegister(req, res) {
        try {
            const { name, gender, email, mobile, password, confirmPassword } = req.body;
    
            // Validate input
            if (!name || !gender || !email || !mobile || !password || !confirmPassword) {
                console.log('All fields are required');
                return res.send('All fields are required');
            }
    
            // Check if email or mobile already exists
            const existingStudent = await Student.findOne({ $or: [{ email }, { mobile }] });
            if (existingStudent) {
                return res.send('Email or mobile already exists');
            }
    
            // Check if passwords match
            if (password !== confirmPassword) {
                return res.send('Passwords do not match');
            }
    
            // Hash the password
            const passwordHash = hashPassword(password);
            console.log(req.body);
    
            // Save the student
            const data = new Student({ name, gender, email, mobile, password: passwordHash });
            console.log(data);
            await data.save();
    
            return res.redirect('/student/login');
        } catch (error) {
            console.log(error);
            return res.send('Something went wrong');
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
            },process.env.SECRET_KEY,{expiresIn:'100m'}) 
            res.cookie("authToken", token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 100 * 60 * 1000 // 100mins
            })
            return res.redirect('/student/dashboard')

        } catch (error) {
            console.log(error)
            return res.send('something went wrong')

        }
    }


    async studentDashboard(req,res){
        try {
            const {_id} = req.user
            const user = await Student.findById(_id).select('name email')
            return res.render('./student/dashbord',{user})
        } catch (error) {
            return res.status(400).json({status:false,message:'Failed to show dashboard'})
        }
    }

    async allExamsPg(req,res){
        try {
            res.render('./student/exam-list')
        } catch (error) {
            return res.status(400).json({status:false,message:'Failed to show live exams'})
        }
    }

    async currentExams(req,res){
        try {
            const currentDate = new Date();
            const exams = await Exam.find({})   
        

            return res.status(200).json({status:true,data:exams})
        } catch (error) {
            console.log(error)
            return res.status(500).json({status:false,message:'Failed to fetch exams'})
        }
    }

    //Question
    async oneQuestionAtATime(req,res){
        try {
            const examId = req.params.examId
            const index = parseInt(req.params.qIndex);
            const studentId = req.user._id;
            // console.log(req.params)
            const questions = await Question.find({exam:examId});
            // console.log(questions)

            if(index >= questions.length){
                return res.redirect(`/student/exam/${examId}/review`);
            }

            const currentQuestion = questions[index];
            const totalQuestions = questions.length;

            res.render('./student/question',{
                examId,
                question:currentQuestion,
                qIndex:index,
                totalQuestions
            })
        } catch (error) {
            console.log(error)
            return res.status(400).json({status:false,message:'Failed to load question page'})
        }
    }
    
    // /student/exam/<%=examId%>/save/<%=qIndex%>
    async saveAnswerAndNext(req, res) {
        try {
            const studentId = req.user._id;
            const { examId, qIndex } = req.params;
            const { qId, answer } = req.body;
    
            // Validate student
            const student = await Student.findById(studentId);
            if (!student) {
                return res.status(400).json({
                    status: false,
                    message: 'Unauthorized user'
                });
            }
    
            // Validate exam
            const exam = await Exam.findById(examId);
            if (!exam) {
                return res.status(400).json({
                    status: false,
                    message: 'Exam not found'
                });
            }
    
            // Validate question
            const question = await Question.findById(qId);
            if (!question) {
                return res.status(400).json({
                    status: false,
                    message: 'Unknown question'
                });
            }
    
            // Check if the answer is correct
            const isCorrect = question.options[question.correctAnswer - 1] === answer;
            console.log('IS CORRECT:', isCorrect);
    
            // Find or create a result for the student and exam
            let result = await Result.findOne({ student: studentId, exam: examId });
            if (!result) {
                // Create a new result if none exists
                result = new Result({
                    student: studentId,
                    exam: examId,
                    score: 0,
                    answers: []
                });
            }
    
            // Check if the question already exists in the answers array
            const existingAnswerIndex = result.answers.findIndex(
                (ans) => ans.question.toString() === question._id.toString()
            );
    
            if (existingAnswerIndex !== -1) {
                // Update the existing answer
                result.answers[existingAnswerIndex].isCorrect = isCorrect;
                result.answers[existingAnswerIndex].selectedAnswer = answer;
                result.answers[existingAnswerIndex].correctAnswer =
                    question.options[question.correctAnswer - 1];
            } else {
                // Add a new answer
                result.answers.push({
                    question: question._id,
                    isCorrect,
                    selectedAnswer: answer,
                    correctAnswer: question.options[question.correctAnswer - 1]
                });
            }
    
            // Ensure markPerQuestion is a valid number
            const markPerQuestion = exam.marksPerQuestion;
            console.log(markPerQuestion,typeof(markPerQuestion))
    
            // Update the score
            const correctAnswersCount = result.answers.filter((ans) => ans.isCorrect).length;
            result.score = markPerQuestion * correctAnswersCount;
    
            // Calculate unanswered questions
            const totalQuestions = await Question.countDocuments({ exam: examId });
            const attemptedQuestions = result.answers.length;
            const unansweredQuestions = totalQuestions - attemptedQuestions;
            result.unanswered = unansweredQuestions;
    
            // Save the updated result
            await result.save();
    
            // Check if this is the last question
            if (parseInt(qIndex) + 1 >= totalQuestions) {
                // Redirect to the result page
                return res.redirect(`/student/exam/${examId}/result`);
            }
    
            // Redirect to the next question
            return res.redirect(`/student/exam/${examId}/question/${parseInt(qIndex) + 1}`);
        } catch (error) {
            console.error('Error saving answer:', error);
            return res.status(500).json({
                status: false,
                message: 'Failed to save answer'
            });
        }
    }

    // Result 
    async showResult(req,res){
        try {
            const examId = req.params.examId;

            const exam = await Exam.findById(examId);
            const studentId = req.user._id;

            const result = await Result.findOne({student:studentId,exam:examId});

            if(!result){
                return res.status(404).json({
                    status: false,
                    message: 'Result not found'
                });
            }

            const totalQuestions = await Question.countDocuments({exam:examId});
            const attemptedQuestions = result.answers.length;
            const unansweredQuestions = totalQuestions - attemptedQuestions;
            const totalMarks = totalQuestions * exam.markPerQuestion;
            const percentage = (result.score / totalMarks) * 100;

            console.log('percentage',percentage)
            console.log('total marks',totalMarks)
            console.log('total questions',totalQuestions)
            console.log('attempted questions',attemptedQuestions)
            return res.render('./student/result',{
                totalMarks,
                unansweredQuestions,
                percentage,
                score:result.score
            })
        } catch (error) {
            console.error('Error fetching result:', error);
            return res.status(500).json({
                status: false,
                message: 'Failed to fetch result'
            });
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