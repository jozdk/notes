import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import path from "path";
import util from "util";
import * as usersModel from "../models/users-superagent.js";
import { sessionCookieName } from "../app.js";
import DBG from "debug";

export const router = express.Router();

const debug = DBG("notes:router-users");
const error = DBG("notes:error-users");

export function initPassport(app) {
    app.use(passport.initialize());
    app.use(passport.session());
}

export function ensureAuthenticated(req, res, next) {
    try {
        debug("ensureAuthenticated: ", req.user);
        if (req.user) {
            next();
        } else {
            res.redirect("/users/login");
        }
    } catch(err) {
        next(err);
    }
}

// router.get("/login", (req, res, next) => {
//     try {
//         res.render("login", { title: "Login to Notes", user: req.user });
//     } catch(err) {
//         next(err);
//     }
// });

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login"
}));

router.get("/logout", (req, res, next) => {
    try {
        req.session.destroy();
        req.logout();
        res.clearCookie(sessionCookieName);
        debug("Logged out user");
        res.redirect("/");
    } catch(err) {
        next(err);
    }
});

router.get("*", (req, res, next) => {
    debug(path.resolve("build/public/index.html"));
    res.sendFile(path.resolve("build/public/index.html"));
});

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const check = await usersModel.checkUserPassword(username, password);
            if (check.check) {
                done(null, { id: check.username, username: check.username });
            } else {
                debug(check.message);
                done(null, false, check.message);
            }
        } catch(err) {
            error(err);
            done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    try {
        done(null, user.username);
    } catch (err) {
        done(err);
    }
});

passport.deserializeUser(async (username, done) => {
    try {
        const user = await usersModel.find(username);
        done(null, user);
    } catch(err) {
        done(err);
    }
});