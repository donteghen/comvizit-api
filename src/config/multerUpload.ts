import multer from 'multer';
import { logger } from '../logs/logger';

const multerUpload = multer({
    storage: multer.diskStorage({}),
    limits:{
        fileSize:2000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/i)){
            logger.error(`Someone tried uploading a file of type : ${file.mimetype}`)
           return cb(new Error('file must be png, jpg or jpeg'));
        }
        cb(undefined, true);
    }
});
export default multerUpload