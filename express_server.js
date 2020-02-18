const express = require("express");
const cookieParser = require("cookie-parser");
const {
  urlsForUser,
  checkUser,
  checkUrl,
  generateRandomString
} = require("./helpers/index");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

let users = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Create a new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }

  const tempUrls = urlsForUser(req.cookies["user_id"], urlDatabase);
  let templateVars = {
    urls: tempUrls,
    user: users,
    user_id: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }
  let templateVars = { user: users, user_id: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }

  const { shortURL } = req.params;
  const result = checkUrl(shortURL, req.cookies["user_id"], urlDatabase);
  if (!result) {
    res.send("Visit denied, it is not your url");
  }
  let templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL]["longURL"],
    user: users,
    user_id: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }
  const result = checkUrl(shortURL, req.cookies["user_id"], urlDatabase);
  if (!result) {
    res.status(403).send("Operation denied, not your url");
  }
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Update url
app.post("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }
  const result = checkUrl(shortURL, req.cookies["user_id"], urlDatabase);
  if (!result) {
    res.status(403).send("Operation denied, not your url");
  }
  const { shortURL } = req.params;
  urlDatabase[shortURL] = {
    longURL: req.body.newURL,
    userID: req.cookies["user_id"]
  };
  res.redirect("/urls");
});

// login
app.post("/login", (req, res) => {
  const loginUser = { email: req.body.email, password: req.body.password };
  const result = checkUser(loginUser, users);
  if (result.passwordmatch === true && result.emailmatch === true) {
    res.cookie("user_id", result.id);
    res.redirect("/urls");
  } else {
    const err = result.msg;
    res.status(403).send(err);
  }
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = { user: users, user_id: req.cookies["user_id"] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString(6);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email and password can't be empty");
  } else {
    const newUser = { id, email: req.body.email, password: req.body.password };
    const result = checkUser(newUser, users);
    if (result.emailmatch) {
      res.status(result.code).send("Email has been taken");
    }
    users[id] = newUser;
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let errmsg;
  if (req.cookies["errmsg"]) {
    errmsg = req.cookies["errmsg"];
    res.clearCookie("errmsg");
  }
  let templateVars = { user: users, user_id: req.cookies["user_id"], errmsg };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
