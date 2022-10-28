import { Request, Response , NextFunction} from "express";
import {Strategy as LocalStrategy} from 'passport-local'
import passport from "passport";
import { Admin } from "./models/admin";
import {compareSync} from 'bcryptjs'

const passportConfig = () => {
    passport.use(
      new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
          const user = await Admin.findOne({ email });
          if (typeof user.approved !== 'boolean' || !user.approved) {
            return done(new Error('Admin permissions pending!'), null)
          }
          if (!user) {
            return done(null, false, { message: "Invalid credentials.\n" });
          }
          if (!compareSync(password, user.password)) {
            return done(null, false, { message: "Invalid credentials.\n" });
          }
          return done(null, user);

        }
      )
    );

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
      const user = await Admin.findById(id);
      if (!user) {
        done(new Error('deserialize failed!'), false);
      }
      done(null, user);
    });
};

function isLoggedIn (req: Request, res: Response, next:NextFunction) {
    console.log(req.session, req.sessionID, req.isAuthenticated())
    if (!req.isAuthenticated()) {
        throw new Error ('Access restricted!')
    }
    next()
}
export {passportConfig, isLoggedIn}