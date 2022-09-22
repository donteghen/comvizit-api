const cloudinary = require('cloudinary').v2

console.log(process.env.CLOUD_NAME)
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    secret: process.env.CLOUD_API_SECRET,
    secure:true
})
module.exports = cloudinary