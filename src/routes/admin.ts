import express, { Request, Response } from 'express'
import {Admin} from '../models/admin'
import passport from 'passport'
import { isLoggedIn } from '../middleware'

const AdminRouter = express.Router()

// fetch admin to makes sure the client is still authenticated
// fetch admin
AdminRouter.get('/api/admin', isLoggedIn, async (req: Request, res: Response) => {
try {

    res.send({ok: true, data: req.user})

} catch (error) {
    // console.log(error)
    res.status(400).send({ok:false, error: error.message})
}
})

// admin signup route
AdminRouter.post('/api/admins/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, username } = req.body;
        const newAdmin = new Admin({
            username, email, password
        })
        const admin = await newAdmin.save()
        res.send({ok:true})
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({ok: false, error:`Validation Error : ${error.message}`})
            return
        }
        res.status(400).send({ok:false, error: error.message})
    }
})

// admin login route
AdminRouter.post('/api/admins/login', passport.authenticate("local", {

    }), async (req: Request, res: Response) => {
    try {

        res.send({ok: true, data: req.user})

    } catch (error) {
        // console.log(error)
        res.status(400).send({ok:false, error: error.message})
    }
})

// admin logout route
AdminRouter.get('/api/admins/logout', isLoggedIn, async (req: Request, res: Response) => {
    try {
        req.session.destroy((err) => {
            if (err) {
              throw err
            }
            res.send({ok: true})
          });
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})

// admin get all admins testing
AdminRouter.get('/api/admins', isLoggedIn, async (req: Request, res: Response) => {
    try {
        const admins = await Admin.find()
        res.send({ok:true, data: admins})
    } catch (error) {
        res.status(400).send({ok:false, error: error.message})
    }
})


export {AdminRouter}