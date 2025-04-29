const express = require('express')
const router = express.Router()
 
const studentController = require('../controller/Student.controller')

// Api Routs
router.post('/login',studentController.studentLogin)
router.post('/register',studentController.studentRegister)
// router.get('/delete/:id',studentController.deleteExaminee)


// Static Routs
router.get('/login',studentController.studentLoginPg)
router.get('/register',studentController.studentRegisterPg)



module.exports = router ;