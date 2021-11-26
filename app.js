const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const helmet = require("helmet");
var xss = require("xss-clean");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  cors({
    origin: [
      "http://blackhole@sardartufani.com",
      "http://localhost:3000",
      "http://sardartufani.com",
      "http://blackhole@sardartufani.com/projects/bolt-saas",
    ],
    methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(helmet());
app.use(xss());
app.use(morgan("tiny"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



require("./app/cronjob/token.generation")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

module.exports=app;