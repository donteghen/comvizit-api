
import {connection, connect, disconnect} from 'mongoose'


export const connectDb = () => {
     connect(process.env.MONGO_STRING)
     .then(() => console.log('db connected'))
     .catch(err => console.log(err))
}

export async function clearDb () {
     const collections = await connection.db.collections()
     for(const currCollection of collections) {
          currCollection.deleteMany({})

     }
}

export async function closeDb() {
     if (!connection) {
          return
     }
     await connection.close()
}