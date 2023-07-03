"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// require('newrelic'); // require new relic to load and startup all preconfigure processes
const dbconfig_1 = require("./config/dbconfig");
const logger_1 = require("./logs/logger"); // bring in the logger to add server start logs for tracing later on.
const server_1 = require("./server"); // Bring in our server config
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
// import {initialize} from 'mongoose-auto-increment'
// set the port
const PORT = process.env.PORT;
const maxTimeout = 1200000;
if (process.env.NODE_ENV === 'production') {
    // let cluster = require('cluster');
    if (cluster_1.default.isPrimary) {
        // Count the machine's CPUs
        let cpuCount = os_1.default.cpus().length;
        console.log('Found ' + cpuCount + ' CPU(s)');
        // Create a worker for each CPU
        for (let i = 0; i < cpuCount; i++) {
            console.log('Creating worker for CPU', i + 1);
            cluster_1.default.fork();
        }
    }
    else {
        init(cluster_1.default.worker.id);
    }
}
else {
    init(1);
}
function init(workerId) {
    console.log('Worker ' + workerId + ': Initializing DB connection...');
    // start server
    (0, dbconfig_1.connectDb)().then(() => {
        console.log('The database has been connected successfully');
        console.log('Worker ' + workerId + ': Initializing routes...');
        server_1.server.listen(PORT, () => {
            if (process.env.NODE_ENV === 'production') {
                logger_1.logger.info('Server started');
            }
            console.log(`Worker ${workerId} is listining at: http://localhost:${PORT}`);
        }).setTimeout(maxTimeout);
    })
        .catch(error => {
        var _a;
        logger_1.logger.error(`Failed to initialize DB due to:  ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Unknown error'}`);
        console.error(new Date(Date.now()).toLocaleString(), " : Failed to initialize DB", error);
    });
}
//# sourceMappingURL=index.js.map