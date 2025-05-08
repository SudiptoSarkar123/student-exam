const express = require('express')
const router = express.Router()
const {AdminsOnly} = require('../middleware/AdminsOnly')
const AdminController = require('../controller/Admin.controller')

// API ROUTS
router.post('/login',AdminController.adminLogin)

// Student Routes
router.get('/student-list',AdminsOnly,AdminController.listExaminee)
router.get('/student/:id',AdminsOnly,AdminController.getSingleStudent)

router.post('/student/:id',AdminsOnly,AdminController.updateExaminee)
router.get('/delete-student/:id',AdminsOnly,AdminController.deleteExaminee)

// Exam Routs 
router.get('/exam-list',AdminsOnly,AdminController.allExamsPg)
router.get('/exams',AdminsOnly,AdminController.getAllExams);
router.get('/exam/:id',AdminsOnly,AdminController.getSingleExam)
router.post('/exam/:id',AdminsOnly,AdminController.updateExam)

router.post('/add-exams',AdminsOnly,AdminController.addExams)
router.get('/add-exams',AdminsOnly,AdminController.addExamsPg)



// Question Routs

router.get('/question-list',AdminsOnly,AdminController.QuestionsPg)
router.get('/question',AdminsOnly,AdminController.allQuestions)
router.get('/add-question',AdminsOnly,AdminController.addQuestionsPg)
router.post('/add-question',AdminsOnly,AdminController.addQuestions)


// STATIC ROUTS

router.get('/login',AdminController.adminLoginPg)
router.get('/adminDash',AdminsOnly,AdminController.adminDash)
router.get('/list-examinee',AdminsOnly,AdminController.listExamineePg)
router.get('/edit-student',AdminsOnly,AdminController.editExamineePg)
router.get('/edit-student-form/:id',AdminsOnly,AdminController.editExamineeForm)



module.exports = router ;