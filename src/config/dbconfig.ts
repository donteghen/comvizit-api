
import {connection, connect} from 'mongoose'
import { logger } from '../logs/logger'


export const connectDb = async() => {
     connection.on('error', (error) => {
          logger.error(`A db error occured : ${error?.message??"Unknown"}`)
     })
     await connect(process.env.MONGO_STRING)
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