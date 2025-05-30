
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
             const user = await Student.findById(req.user._id)
            if(!user){
                return res.status(404).json({status:false,message:'User not found'})
            }
            res.render('./student/exam-list',{user})
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
    async questionPg(req,res){
        try {
           const {examId} = req.params;
        //    const qIndex = req.params.qIndex || 0 ;
        //    const studentId = req.user._id;

        const exam = await Exam.findById(examId)
        if(!exam){
            return res.status(404).json({status:false,message:'Exam not found'})
        }
        //    Check if already submitted
        //    const alreadySubmitted = await Result.findOne({
        //     student:studentId,
        //     exam:examId,
        //    })
        //    if(alreadySubmitted){
        //     return res.status(500).json({
        //         status:false,
        //         message:'You have already subbmitted this exam.'
        //     })
        //    }

           // Load exam and render page 
        //    const exam = await Exam.findById(examId)
           const totalQs = await Question.find({exam:examId})
        //    const question = await Question.find({exam:examId})
            // console.log('question',question[qIndex],'index',qIndex,'total questions',totalQuestions.length,'exam id',examId)
            console.log('totalQs',totalQs.length)
           return res.render('./student/question',{
            examId,
            totalQs:totalQs.length,
            duration:exam.duration,
        })
        } catch (error) {
            
            console.log(error)
            return res.status(400).json({status:false,message:'Failed to load question page'})
        }
    }

    async loadSidebar(req,res){
        try {
            console.log('i am in loadsidbar')
            const {examId} = req.params;

            // Fetch the total number of questions for the exam
            const totalQuestions = await Question.countDocuments({exam:examId});

            return res.json({totalQuestions})
        } catch (error) {
            console.log(error);
            return res.status(500).json({status:false, message:'Failed to fetch questions'});
        }
    }
    
    // /student/exam/<%=examId%>/save/<%=qIndex%>
    async getOneQuestion(req,res){
        try {
            const {examId,qIndex} = req.params;
            const question = await Question.find({exam:examId}).skip(qIndex).limit(1);
            if(!question || question.length === 0){
                return res.status(404).json({status:false,message:'Question not found'})
            }
            return res.json(question[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({status:false,message:'Failed to fetch question'});
        }
    }
   
    // Submit exam 

 async submitExam(req, res) {
    try {
        console.log('req.body',req.body)
        const { examId } = req.params;
        const { answers } = req.body;
        const studentId = req.user._id;

        console.log(answers);
        // Fetch all questions for the exam
        const questions = await Question.find({ exam: examId });
        console.log(questions)
        let score = 0;
        let unanswered = 0;
        const answerDetails = [];

        // Calculate the score
        questions.forEach((question) => {
            const submittedAnswer = answers[question._id];
            const isCorrect = submittedAnswer?.trim().toLowerCase() === question.options[parseInt(question.correctAnswer) - 1]?.trim().toLowerCase();
            console.log(isCorrect)
            if (!submittedAnswer) {
                unanswered++;
            } else if (isCorrect) {
                score++;
            }

            // Add answer details for this question
            answerDetails.push({
                question: question._id,
                isCorrect,
                selectedAnswer: submittedAnswer || null,
                correctAnswer: question.correctAnswer,
            });
        });

        // Fetch the exam details to calculate total marks
        const exam = await Exam.findById(examId);
        const totalMarks = score * exam.marksPerQuestion;

        console.log('total marks', totalMarks);

        // Save the result in the database
        const result = new Result({
            student: studentId,
            exam: examId,
            score: totalMarks,
            answers: answerDetails,
            unanswered,
        });

        await result.save();

        return res.status(200).json({
            status: true,
            message: 'Exam submitted successfully!',
            result: {
                totalMarks,
                correctAnswers: score,
                unansweredQuestions: unanswered,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Failed to calculate result',
        });
    }
}

    // Result 


   async allResultsPg(req, res) {
    try {
        const studentId = req.user._id;
        const user = await Student.findById(studentId);

        // Aggregation to join Result with Exam and exam title
        const results = await Result.aggregate([
            { $match: { student: user._id } },
            {
                $lookup: {
                    from: 'exams', // <-- correct spelling
                    localField: 'exam',
                    foreignField: '_id', // <-- correct spelling
                    as: 'examInfo'
                }
            },
            { $unwind: '$examInfo' },
            { $sort: { createdAt: -1 } } // <-- correct spelling
        ]);

        res.render('student/allResults', { results, user });
    } catch (error) {
        console.log(error)
        res.status(500).send('Error loading results');
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

    async logoutStudent(req,res){
       res.clearCookie("authToken")
        return res.redirect('/student/login')
    }
}


module.exports = new studentController()