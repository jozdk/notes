import { default as express } from "express";
export const router = express.Router();

router.get("/", async (req, res, next) => {
    // code for notes retrieval
    res.render("index", { title: "Notes" });
});