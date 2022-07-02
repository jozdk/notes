import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
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

export function initPassportForSocketIo(parentNamespace, sessionMiddleware) {
    const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

    parentNamespace.use(wrap(sessionMiddleware));
    parentNamespace.use(wrap(passport.initialize()));
    parentNamespace.use(wrap(passport.session()));

    parentNamespace.use((socket, next) => {
        if (socket.request.user) {
            next();
        } else {
            next(new Error("unauthorized"));
        }
    });
}

export function ensureAuthenticated(req, res, next) {
    try {
        debug("ensureAuthenticated: ", req.user);
        if (req.user) {
            next();
        } else {
            // res.redirect("/users/login");
            res.status(403).json({ msg: "Not authorized" });
        }
    } catch (err) {
        next(err);
    }
}

export function login(req, res, next) {
    if (req.user) {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                username: req.user.username
            }
        })
    } else {
        res.json({
            success: false
        });
    }
}

router.post("/users/login",
    (req, res, next) => {
        debug(req.body);
        next();
    },
    passport.authenticate("local"),
    (req, res, next) => {
        debug("/users/login requested");
        login(req, res, next);
    }
);

router.post("/users/logout", ensureAuthenticated, (req, res, next) => {
    try {
        req.session.destroy();
        req.logout();
        res.clearCookie(sessionCookieName);
        debug("Logged out user");
        res.status(200).json({
            success: true,
            msg: "Logout successfull"
        });
    } catch (err) {
        next(err);
    }
});

router.post("/auth", (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                username: req.user.username
            }
        });
    } else {
        res.json({
            success: false
        });
    }
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
        } catch (err) {
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
    } catch (err) {
        done(err);
    }
});