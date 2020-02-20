const express = require("express");
const Routes = require("./routes/index");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["dheojdkshir"],

    maxAge: 24 * 60 * 60 * 1000
  })
);

app.set("view engine", "ejs");
app.use("/", Routes);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
