import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

// console.log(process.env.CLOUD_NAME, process.env.CLOUD_API_KEY, process.env.CLOUD_API_SECRET)
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure:true
})
export default cloudinary