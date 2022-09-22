import cloudinary from 'cloudinary'


cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    secret: process.env.CLOUD_API_SECRET,
    secure:true
})
export default cloudinary