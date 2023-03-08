"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logs/logger");
const server_1 = require("./server");
// set the port
const PORT = process.env.PORT;
// start server
server_1.app.listen(PORT, () => {
    logger_1.logger.info('Server started');
    console.log(`Server is listining at: http://loccalhost:${PORT}`);
});
//# sourceMappingURL=index.js.map