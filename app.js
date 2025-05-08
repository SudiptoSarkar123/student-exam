const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const dbcon = require('./app/config/dbcon')()
const session = require('express-session');
const flash = require('connect-flash');
const Admin = require('./app/model/Admin')
const {hashPassword} = require('./app/helper/Auth')
const cookieParser = require('cookie-parser')

app.use(cookieParser())


app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.static('public'))


app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}))

app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

async function createFirstAdmin(req, res, next) {
   const admin = await Admin.findOne({role:'admin'})
   if(!admin){
    console.log('No admin found, creating first admin...');
    const password = hashPassword('123');

    const admin = new Admin({
        name:'AdminName',
        email:'admin355@example.com',
        password:password,
        role:'admin'
    })
    await admin.save()
    console.log('Admin created successfully');
   }
}


createFirstAdmin()



const adminRoute = require('./app/router/AdminRoute')
const studentRout = require('./app/router/StudentRoute')
app.use('/student',studentRout)
app.use('/admin', adminRoute)

const port = process.env.PORT || 4055;
app.listen(port, () => console.log('Server is running at ', port))