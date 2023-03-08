
import { logger } from './logs/logger'
import {app} from './server'

// set the port
const PORT = process.env.PORT


// start server
app.listen(PORT, () => {
    logger.info('Server started')
    console.log(`Server is listining at: http://loccalhost:${PORT}`)
})

