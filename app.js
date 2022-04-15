import { default as express } from "express";
import { engine } from "express-handlebars";
import * as path from "path";
import { default as logger } from "morgan";
import { default as cookieParser } from "cookie-parser";
import * as http from "http";
import { approotdir } from "./approotdir.js";
const __dirname = approotdir;
import {
    normalizePort, onError, onListening, handle404, basicErrorHandler
} from "./appsupport.js"
import { InMemoryNotesStore } from "./models/notes-memory.js";
export const NotesStore = new InMemoryNotesStore();

import { router as indexRouter } from "./routes/index.js";
import { router as notesRouter } from "./routes/notes.js";

export const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets/vendor/bootstrap", express.static(path.join(__dirname, "node_modules", "bootstrap", "dist")));

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