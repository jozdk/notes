import { default as express } from "express";
import { engine } from "express-handlebars";
import * as path from "path";
import { default as logger } from "morgan";
import { default as rfs } from "rotating-file-stream";
import { default as DBG } from "debug";
const debug = DBG("notes:debug");
// const error = DBG("notes:error");
import { default as cookieParser } from "cookie-parser";
import * as http from "http";
import util from "util";
import { approotdir } from "./approotdir.js";
const __dirname = approotdir;
import {
    normalizePort, onError, onListening, handle404, basicErrorHandler
} from "./appsupport.js"

import { router as indexRouter } from "./routes/index.js";
import { router as notesRouter } from "./routes/notes.js";

import { useModel as useNotesModel } from "./models/notes-store.js";

useNotesModel(process.env.NOTES_MODEL ? process.env.NOTES_MODEL : "memory")
.then((store) => {
    debug(`Using NotesStore ${util.inspect(store)}`);
})
.catch((err) => {
    onError({
        code: "ENOTESSTORE",
        error: err
    });
})

export const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

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
if (process.env.REQUEST_LOG_FILE) {
    app.use(logger(process.env.REQUEST_LOG_FORMAT || "dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets/vendor/bootstrap", express.static(path.join(__dirname, "node_modules", "bootstrap", "dist")));
app.use("/assets/vendor/bootstrap-icons", express.static(path.join(__dirname, "node_modules", "bootstrap-icons", "font")))

// Router functions
app.use("/", indexRouter);
app.use("/notes", notesRouter);

// Error handlers
app.use(handle404);
app.use(basicErrorHandler);

export const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

export const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
server.on("request", (req, res) => {
    debug(`${new Date().toISOString()} request ${req.method} ${req.url}`);
});