import { Request, Response , NextFunction} from "express";
import {Strategy as LocalStrategy} from 'passport-local'
import passport from "passport";
import { User } from "../models/user";
import {compareSync} from 'bcryptjs'
import { AUTH_FAILED } from "../constants/error";

const passportConfig = () => {
      passport.use(
        new LocalStrategy(
          { usernameField: "email", passwordField: "password" },
          async (email, password, done) => {
            const user = await User.findOne({ email });
            if (!user) {
              return done(null, false, { message: "Invalid credentials.\n" });
            }
            if (!compareSync(password, user.password)) {
              // console.log('Wrong password!')
              return done(null, false, { message: "Invalid credentials.\n" });
            }
            if (typeof user.approved !== 'boolean' || !user.approved) {
              return done(null, false, {message: "User permissions pending!"})
            }
            if (typeof user.isVerified !== 'boolean' || !user.isVerified) {
              return done(null, false, {message: "User account is not yet verified!"})
            }
            return done(null, user);

          }
        )
      );

      passport.serializeUser((user, done) => {
        done(null, user.id);
      });

      passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        if (!user) {
          done(new Error('deserialize failed!'), false);
        }
        done(null, user);
      });
};

// helper function that checks if user is authenticated
function isLoggedIn (req: Request, res: Response, next:NextFunction) {
     // console.log(req.sessionID, req.isAuthenticated(), req.user)
    if (!req.isAuthenticated()) {
        next('Access restricted!')
    }
    next()
}

// helper function that checks if an authenticated user is a tenant
function isTenant (req: Request, res: Response, next:NextFunction) {
  if (req.user.role !== 'TENANT') {
      next('Access restricted to approved and authenticated tenants only!')
  }
  next()
 }

// helper function that checks if an authenticated user is a landlord
function isLandlord (req: Request, res: Response, next:NextFunction) {
 if (req.user.role !== 'LANDLORD') {
     next('Access restricted to approved and authenticated landlords only!')
 }
 next()
}

// helper function that checks if an authenticated user is an admin
function isAdmin (req: Request, res: Response, next:NextFunction) {
  if (req.user.role !== 'ADMIN') {
      next('Access restricted to admins only!')
  }
  next()
 }
export {passportConfig, isLoggedIn, isTenant, isLandlord, isAdmin}