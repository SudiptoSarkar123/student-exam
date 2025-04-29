const express = require('express')
const router = express.Router()
const {AdminsOnly} = require('../middleware/AdminsOnly')
const AdminController = require('../controller/Admin.controller')

// API ROUTS
router.post('/login',AdminController.adminLogin)
router.post('/edit/:id',AdminsOnly,AdminController.editExaminee)
router.get('/delete-student/:id',AdminsOnly,AdminController.deleteExaminee)
router.post('/add-exams',AdminsOnly,AdminController.addExams)
router.post('/add-question',AdminsOnly,AdminController.addQuestions)







// STATIC ROUTS

router.get('/login',AdminController.adminLoginPg)
router.get('/adminDash',AdminsOnly,AdminController.adminDash)
router.get('/list-examinee',AdminsOnly,AdminController.listExaminee)
router.get('/edit-student',AdminsOnly,AdminController.editExamineePg)
router.get('/edit-student-form/:id',AdminsOnly,AdminController.editExamineeForm)
router.get('/all-exams',AdminsOnly,AdminController.allExams)

router.get('/add-exams',AdminsOnly,AdminController.addExamsPg)

router.get('/all-question',AdminsOnly,AdminController.allQuestions)
router.get('/add-question',AdminsOnly,AdminController.addQuestionsPg)

module.exports = router ;