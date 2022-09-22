const express = require('express')
require('dotenv').config()
const cloudinary = require('./config/cloudinary')


const app = express()
const PORT = process.env.PORT



app.listen(PORT, () => {
    console.log(`Server is listining at: http://loccalhost:${PORT}`)
})