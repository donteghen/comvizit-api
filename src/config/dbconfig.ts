
import {connection, connect} from 'mongoose'
import { logger } from '../logs/logger'

const prodEnv = process.env.NODE_ENV === 'production'
export const connectDb = async () => {
     connection.on('error', (error) => {
          if (prodEnv) {
               console.log(`A db error occured : ${error?.message??"Unknown"}`)
          }
          else {
               logger.error(`A db error occured : ${error?.message??"Unknown"}`)
          }
     })
     connection.once('open', function () {
          if (prodEnv) {
               logger.info("MONGODB Intializing autoincrement plugin");
          }
          else {
               console.log("MONGODB Intializing autoincrement plugin");
          }
      });
      connection.on('reconnected', () => {
          if (prodEnv) {
               logger.info('MONGODB Connection Reestablished');
          }
          else {
               console.log('MONGODB Connection Reestablished');
          }
      });

      connection.on('disconnected', () => {
          if (prodEnv) {
               logger.info('MONGODB Connection Disconnected');
          }
          else {
               console.log('MONGODB Connection Disconnected');
          }
      });

      connection.on('close', () => {
          if (prodEnv) {
               logger.info('MONGODB Connection Closed');
          }
          else {
               console.log('MONGODB Connection Closed');
          }
      });

      connection.on('error', (error: any) => {
          if (prodEnv) {
               logger.info(`MONGODB ERROR: ${error}`);
          }
          else {
               console.log('MONGODB ERROR:', error);
          }
          console.error('MONGODB ERROR:', error);
      });


     await connect(process.env.MONGO_STRING);

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
