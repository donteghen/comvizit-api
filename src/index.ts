

import dotenv from 'dotenv'
// local module imports
import {connectDb} from './config/dbconfig'

// global settings
dotenv.config()
connectDb().then(() => console.log('db connected'))
.catch(err => console.log(err))

const PORT = process.env.PORT

import {app} from './server'




// start server
app.listen(PORT, () => {
    console.log(`Server is listining at: http://loccalhost:${PORT}`)
})

