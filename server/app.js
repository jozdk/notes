import { default as express } from "express";
import * as path from "path";
import { default as logger } from "morgan";
import { default as rfs } from "rotating-file-stream";
import { default as cookieParser } from "cookie-parser";
import * as http from "http";
import util from "util";
import { default as DBG } from "debug";
import dotenv from "dotenv";
import session from "express-session";
import sessionFileStore from "session-file-store";
import { Server as SocketioServer } from "socket.io";
import { approotdir } from "../approotdir.js";
const __dirname = approotdir;
import {
    normalizePort, onError, onListening, handle404, basicErrorHandler
} from "./appsupport.js";

import { router as indexRouter, init as indexInit } from "./routes/index.js";
import { router as notesRouter, init as notesInit } from "./routes/notes.js";
import { router as usersRouter, initPassport, initPassportForSocketIo } from "./routes/users.js";

import { useModel as useNotesModel } from "./models/notes-store.js";

dotenv.config();

const debug = DBG("notes:debug");

// Set NotesModel
useNotesModel(process.env.NOTES_MODEL ? process.env.NOTES_MODEL : "memory")
.then(({ notesStore, usersStore }) => {
    debug(`Using NotesStore ${util.inspect(notesStore)}`);
    indexInit();
    notesInit();
})
.catch((err) => {
    onError({
        code: "ENOTESSTORE",
        error: err
    });
})

// Set up express session and session store
const FileStore = sessionFileStore(session);
export const sessionCookieName = "notescookie.sid";
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new FileStore({ path: "sessions" }),
    name: sessionCookieName,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: true,
        secure: process.env.NODE_ENV === "production" ? true : false
    }
})

// Express set-up
export const app = express();

export const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

export const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
server.on("request", (req, res) => {
    debug(`${new Date().toISOString()} request ${req.method} ${req.url}`);
});

// Set up socket.io
export const io = new SocketioServer(server);

initPassportForSocketIo(io.of("/home"), sessionMiddleware);
initPassportForSocketIo(io.of("/notes"), sessionMiddleware);

// Middleware
app.use(logger(process.env.REQUEST_LOG_FORMAT || "dev", {
    stream: process.env.REQUEST_LOG_FILE ?
        rfs.createStream(process.env.REQUEST_LOG_FILE, {
            size: "10M",
            interval: "1d",
            compress: "gzip"
        })
        : process.stdout
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionMiddleware);
initPassport(app);
app.use(express.static(path.join(__dirname, "client", "public")));
app.use("/assets/vendor/bootstrap-icons", express.static(path.join(__dirname, "node_modules", "bootstrap-icons", "font")))

// Routers
app.use(indexRouter);
app.use(notesRouter);
app.use(usersRouter);
app.get("*", (req, res, next) => {
    res.sendFile(path.resolve("client/public/index.html"));
});

// Error handlers
app.use(handle404);
app.use(basicErrorHandler);
