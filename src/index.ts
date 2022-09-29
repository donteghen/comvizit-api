
import {app} from './server'

// set the port
const PORT = process.env.PORT






// start server
app.listen(PORT, () => {
    console.log(`Server is listining at: http://loccalhost:${PORT}`)
})

