const express = require('express')
const router = express.Router()
 
const studentController = require('../controller/Student.controller')
const {StudentsOnly} = require('../middleware/StudentsOnly')

// Api Routs
router.post('/login',studentController.studentLogin)
router.post('/register',studentController.studentRegister)
router.get('/dashboard',StudentsOnly,studentController.studentDashboard)


//exam
router.get('/exams',StudentsOnly,studentController.allExamsPg)
router.get('/current-exams',StudentsOnly,studentController.currentExams)

// question
router.get('/exam/:examId/question/:qIndex',StudentsOnly,studentController.oneQuestionAtATime)
// /student/exam/<%=examId%>/save/<%=qIndex%>
router.post('/exam/:examId/save/:qIndex',StudentsOnly,studentController.saveAnswerAndNext)


// result page
router.get('/exam/:examId/result',StudentsOnly,studentController.showResult)
  
// Static Routs
router.get('/login',studentController.studentLoginPg)
router.get('/register',studentController.studentRegisterPg)



module.exports = router ;