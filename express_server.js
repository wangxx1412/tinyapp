const express = require("express");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const {
  urlsForUser,
  checkUrlOwner,
  generateRandomString,
  getUserByEmail
} = require("./helpers/index");

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
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

let users = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// Main page will redirect
app.get("/", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

// Get the urlsindex page
app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }

  const tempUrls = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = {
    urls: tempUrls,
    user: users,
    user_id: req.session.user_id
  };
  res.render("urls_index", templateVars);
});

// Create a new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    created: new Date()
  };
  res.redirect(`/urls/${shortURL}`);
});

// ShortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(403).send("Not a valid shortURL");
  }
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

// Get the create new shortURL page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }
  let templateVars = { user: users, user_id: req.session.user_id };
  res.render("urls_new", templateVars);
});

// Get the detail page for single shortURL
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }

  const { shortURL } = req.params;
  const result = checkUrlOwner(shortURL, req.session.user_id, urlDatabase);
  if (!result) {
    res.send("Visit denied, it is not your url");
  }
  if (urlDatabase[shortURL] === undefined) {
    res.send("Not a valid shorURL address");
  }
  let dateStr = "";
  for (const url in urlDatabase) {
    if (url === shortURL) {
      dateStr =
        (urlDatabase[url]["created"].getMonth() + 1).toString() +
        "/" +
        urlDatabase[url]["created"].getDate() +
        "/" +
        urlDatabase[url]["created"].getFullYear();
    }
  }

  let templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL]["longURL"],
    user: users,
    user_id: req.session.user_id,
    created: dateStr
  };
  res.render("urls_show", templateVars);
});

// Delete single shortURL
app.delete("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }
  const result = checkUrlOwner(
    req.params.shortURL,
    req.session.user_id,
    urlDatabase
  );
  if (!result) {
    res.status(403).send("Operation denied, not your url");
  }
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Update ShortURL
app.put("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.cookie("errmsg", "Please login to continue");
    res.redirect("/login");
  }
  const result = checkUrlOwner(
    req.params.shortURL,
    req.session.user_id,
    urlDatabase
  );
  if (!result) {
    res.status(403).send("Operation denied, not your url");
  }
  const { shortURL } = req.params;
  urlDatabase[shortURL] = {
    longURL: req.body.newURL,
    userID: req.session.user_id,
    created: new Date()
  };
  res.redirect("/urls");
});

// Get the login page
app.get("/login", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect("/urls");
  }
  let errmsg;
  if (req.cookies["errmsg"]) {
    errmsg = req.cookies["errmsg"];
    res.clearCookie("errmsg");
  }
  let templateVars = { user: users, user_id: req.session.user_id, errmsg };
  res.render("login", templateVars);
});

// POST login user api
app.post("/login", (req, res) => {
  const userID = getUserByEmail(req.body.email, users);
  if (userID) {
    const isMatch = bcrypt.compareSync(
      req.body.password,
      users[userID].password
    );
    if (isMatch) {
      req.session.user_id = userID;
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid credentials");
    }
  } else {
    res.status(403).send("User not found");
  }
});

// Logout api
app.post("/logout", (req, res) => {
  req.session = null;
  //Redirect to /urls will then redirect to /login
  //Thus redirect to /login makes much sense
  res.redirect("/login");
});

// Get the register page
app.get("/register", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect("/urls");
  }
  let templateVars = { user: users, user_id: req.session.user_id };
  res.render("register", templateVars);
});

// POST register user api
app.post("/register", (req, res) => {
  const id = generateRandomString(6);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email and password can't be empty");
  } else {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        const newUser = { id, email: req.body.email, password: hash };
        const result = getUserByEmail(req.body.email, users);
        if (result) {
          res.status(403).send("Email has been taken");
        }
        users[id] = newUser;
        req.session.user_id = id;
        res.redirect("/urls");
      });
    });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
