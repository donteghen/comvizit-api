
import {connection, connect} from 'mongoose'


export const connectDb = async() => {
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