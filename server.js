const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const helmet = require("helmet");
var xss = require("xss-clean");
const path = require("path");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
var corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const db = require("./app/models");

db.mongoose
  .connect(
    `mongodb+srv://node-db:node-db@cluster0.xa2lf.mongodb.net/boldsaas?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

const PORT = process.env.PORT || 4015;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
