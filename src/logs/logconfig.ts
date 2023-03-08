import {format, transports, createLogger}  from 'winston'
import { Logtail }  from '@logtail/node';
import { LogtailTransport } from '@logtail/winston' ;
import { MongoDBTransportInstance,MongoDBConnectionOptions } from "winston-mongodb";

const { MongoDB }: { MongoDB: MongoDBTransportInstance } = require("winston-mongodb");
import dotenv from 'dotenv'

dotenv.config()
const {json, timestamp, errors, combine, metadata} = format

/*
 levels : {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}
 */


const dbOptions = {
    level: 'silly',
    collection: 'logs',
    db: 'mongodb+srv://comvizit:comvizit2022@cluster0.536pzjz.mongodb.net/?retryWrites=true&w=majority',
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    handleExceptions: true,
    capped: true,
    includeIds: true,
    format: combine(
        errors({stack: true}),
        timestamp({format: "YY-MM-DD HH:mm:ss"}),
        json({}),
        metadata()
    )
}

const mongoTransport = new MongoDB({...dbOptions} as MongoDBConnectionOptions);

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);

const logConfig = createLogger({
    level:'silly', // get log level from process env or set default to silly
    format: combine(
        errors({stack: true}),
        timestamp({format: "YY-MM-DD HH:mm:ss"}),
        json()
    ),
    transports: [
        new transports.Console(),
        new LogtailTransport(logtail),
        mongoTransport
    ]
});

export = logConfig
