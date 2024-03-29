import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { UsersStore as users } from "../models/notes-store.js";
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
        console.log(`Login requested for username ${req.body.username}`);
        next();
    },
    passport.authenticate("local"),
    (req, res, next) => {
        console.log(`Login for ${req.user.username} successful`);
        login(req, res, next);
    }
);

router.post("/users/logout", ensureAuthenticated, (req, res, next) => {
    try {
        req.logout((err) => {
            if (err) {
                console.log(err);
                throw new Error(err);
            } else {
                req.session.destroy();
                res.clearCookie(sessionCookieName);
                res.status(200).json({
                    success: true,
                    msg: "Logout successful"
                });
                console.log("Logged out user");
            }
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
        res.status(401).json({
            success: false
        });
    }
});

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const check = await users.checkPassword(username, password)
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
        const user = await users.read(username);
        done(null, user);
    } catch (err) {
        done(err);
    }
});