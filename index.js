import "dotenv/config.js";
import compression from "compression";
import cookieParser from "cookie-parser";
import ejs from "ejs";
import express from "express";
import minifyHTML from "express-minify-html";
import morgan from "morgan";
import config from "./config.js";
import expert from "./questions/expert.json" assert { type: "json" };
import hard from "./questions/hard.json" assert { type: "json" };
import normal from "./questions/normal.json" assert { type: "json" };
import { Logger } from "./utils/logger.js";
import path from "path";
import exp from "constants";
const app = express();

if (process.env.NODE_ENV !== "production") app.use(morgan(Logger("event", ":method :url :status :res[content-length] - :response-time ms")));
const port = process.env.PORT || 8080;
const domain = process.env.DOMAIN || "http://localhost";

const questions = {
 normal,
 hard,
 expert,
};

console.log(Logger("event", `Loaded ${normal.length} normal questions! [${config.timeout.normal}s timeout]`));
console.log(Logger("event", `Loaded ${hard.length} hard questions! [${config.timeout.hard}s timeout]`));
console.log(Logger("event", `Loaded ${expert.length} expert questions! [${config.timeout.expert}s timeout]`));
console.log(Logger("info", `Max questions: ${config.max_questions}`));

app.engine("html", ejs.renderFile);
app.set("view engine", "html");

app.use(express.static("static"));
app.use(compression());
app.use(
 minifyHTML({
  override: true,
  exception_url: false,
  htmlMinifier: {
   removeComments: true,
   collapseWhitespace: true,
   collapseBooleanAttributes: true,
   removeAttributeQuotes: true,
   removeEmptyAttributes: true,
   minifyJS: true,
  },
 })
);

const renderTemplate = (res, req, template, data = {}) => {
 const baseData = {
  domain,
  config,
  port,
 };
 res.render(path.resolve(`./pages/${template}`), Object.assign(baseData, data));
};

app.use(cookieParser());

/*
app.use("trust proxy", 1);
app.use((req, res, next) => {
 req.secure ? next() : res.redirect("https://" + req.headers.host + req.url);
});
*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
 renderTemplate(res, req, "index.ejs", {});
});

app.get("/:mode/:question/:correct_answers", async (req, res) => {
 if (["normal", "hard", "expert"].includes(req.params.mode) == false) return res.redirect("/");

 if (req.params.question == config.max_questions) {
  return renderTemplate(res, req, "end_screen.ejs", {
   correct_answers: req.params.correct_answers || 0,
   questions: questions[req.params.mode],
   mode: req.params.mode.toString(),
   question_number: req.params.question,
  });
 } else {
  renderTemplate(res, req, "level.ejs", {
   correct_answers: req.params.correct_answers || 0,
   questions: questions[req.params.mode],
   mode: req.params.mode.toString(),
   question_number: req.params.question,
  });
 }
});

app.post("/:mode/:question/:correct_answers", async (req, res) => {
 if (["normal", "hard", "expert"].includes(req.params.mode) == false) return res.redirect("/");

 renderTemplate(res, req, "answer.ejs", {
  mode: req.params.mode,
  questions: questions[req.params.mode],
  correct_answers: req.params.correct_answers || 0,
  question: req.params.question,
  answer: req.body.answer,
 });
});

app.listen(port, null, null, () => {
 console.log(Logger("ready", `Listening on port ${port}`));
});

export default app;