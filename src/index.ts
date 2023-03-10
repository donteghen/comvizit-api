
require('newrelic'); // require new relic to load and startup all preconfigure processes
import { connectDb } from './config/dbconfig';
import { logger } from './logs/logger' // bring in the logger to add server start logs for tracing later on.
import {app} from './server' // Bring in our server config
import cluster from 'cluster';
import os from 'os'
// set the port
const PORT = process.env.PORT
const maxTimeout = 1200000;



if (process.env.NODE_ENV === 'production') {
    // let cluster = require('cluster');
    if (cluster.isPrimary) {
        // Count the machine's CPUs
        let cpuCount = os.cpus().length;
        console.log('Found ' + cpuCount + ' CPU(s)');
        // Create a worker for each CPU
        for (let i = 0; i < cpuCount; i++) {
            console.log('Creating worker for CPU', i + 1);
            cluster.fork();
        }
    }
    else {
        init(cluster.worker.id);
    }
}
else {
    init(1);
}

function init( workerId: number ) {
    console.log('Worker ' + workerId  + ': Initializing DB connection...');
    // start server
    connectDb().then(() => {
        console.log('The database has been connected successfully')
        console.log('Worker ' + workerId + ': Initializing routes...');
        app.listen(PORT, () => {
            if (process.env.NODE_ENV === 'production') {
                logger.info('Server started')
            }
            console.log(`Worker ${workerId} is listining at: http://loccalhost:${PORT}`)
        }).setTimeout(maxTimeout)
    })
    .catch(error => {
        logger.error(`Failed to initialize DB due to:  ${error?.message??'Unknown error'}`)
        console.error(new Date(Date.now()).toLocaleString(), " : Failed to initialize DB", error)
    })
}