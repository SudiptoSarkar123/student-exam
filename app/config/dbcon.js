const mongoose = require('mongoose')

const dbcon = async ()=>{
    try {
        const dbconnection = await mongoose.connect(process.env.MONGO_URI)
        console.log('database connected ...')
    } catch (error) {
        console.log(error)
    }
}

module.exports = dbcon