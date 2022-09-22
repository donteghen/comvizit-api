
import {connect} from 'mongoose'


export const connectDb = async () : Promise<void> => {
     connect(process.env.MONGO_STRING)
     .then(() => console.log('Db is connected'))
     .catch(error => console.log(error))
}
