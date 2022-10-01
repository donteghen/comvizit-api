import multer from 'multer';

const multerUpload = multer({
    storage: multer.diskStorage({}),
    limits:{
        fileSize:2000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/i)){
           return cb(new Error('file must be png, jpg or jpeg'));
        }
        cb(undefined, true);
    }
});
export default multerUpload