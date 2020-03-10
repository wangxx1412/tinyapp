const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const {
  urlsForUser,
  checkUrlOwner,
  generateRandomString,
  getUserByEmail
} = require("../helpers/index");

router.use(methodOverride("_method"));

let users = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJs48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// Main page will redirect
router.get("/", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

// Get the urlsindex page
router.get("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    res.send("Please login/register to continue");
  } else {
    const tempUrls = urlsForUser(req.session.user_id, urlDatabase);
    let templateVars = {
      urls: tempUrls,
      user: users,
      user_id: req.session.user_id
    };
    res.render("urls_index", templateVars);
  }
});

// Create a new url
router.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    visitor: [],
    visits: [],
    count: 0,
    created: new Date()
  };
  res.redirect(`/urls/${shortURL}`);
});

// ShortURL to longURL
router.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  if (urlDatabase[shortURL] === undefined) {
    res.status(403).send("Not a valid shortURL");
  }
  urlDatabase[shortURL].count++;

  if (req.session.visitor_id === undefined) {
    const visitor_id = generateRandomString(6);
    urlDatabase[shortURL]["visitor"].push(visitor_id);
    req.session.visitor_id = visitor_id;
    urlDatabase[shortURL]["visits"].push({ visitor_id, created: new Date() });
  } else {
    urlDatabase[shortURL]["visits"].push({
      visitor_id: req.session.visitor_id,
      created: new Date()
    });
    const found = urlDatabase[shortURL]["visitor"].includes(
      req.session.visitor_id
    );
    if (!found) {
      urlDatabase[shortURL]["visitor"].push({
        visitor_id: req.session.visitor_id,
        created: new Date()
      });
    }
  }

  const longURL = urlDatabase[shortURL]["longURL"];
  res.redirect(longURL);
});

// Get the create new shortURL page
router.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.send("Please login/register to continue");
  } else {
    let templateVars = { user: users, user_id: req.session.user_id };
    res.render("urls_new", templateVars);
  }
});

// Get the detail page for single shortURL
router.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.send("Please login/register to continue");
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
    count: urlDatabase[shortURL]["count"],
    longURL: urlDatabase[shortURL]["longURL"],
    user: users,
    user_id: req.session.user_id,
    visitorsNum: urlDatabase[shortURL]["visitor"].length,
    visits: urlDatabase[shortURL]["visits"],
    created: dateStr
  };
  res.render("urls_show", templateVars);
});

// Delete single shortURL
router.delete("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.send("Please login/register to continue");
  } else {
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
  }
});

// Update ShortURL
router.put("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    res.send("Please login/register to continue");
  } else {
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
      count: urlDatabase[shortURL]["count"],
      visitor: [],
      visits: urlDatabase[shortURL]["visits"],
      created: new Date()
    };
    res.redirect("/urls");
  }
});

// Get the login page
router.get("/login", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect("/urls");
  } else {
    let errmsg;
    if (req.cookies["errmsg"]) {
      errmsg = req.cookies["errmsg"];
      res.clearCookie("errmsg");
    }
    let templateVars = { user: users, user_id: req.session.user_id, errmsg };
    res.render("login", templateVars);
  }
});

// POST login user api
router.post("/login", (req, res) => {
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
router.post("/logout", (req, res) => {
  req.session = null;
  //Redirect to /urls will then redirect to /login
  //Thus redirect to /login makes much sense
  res.redirect("/login");
});

// Get the register page
router.get("/register", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect("/urls");
  }
  let templateVars = { user: users, user_id: req.session.user_id };
  res.render("register", templateVars);
});

// POST register user api
router.post("/register", (req, res) => {
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

module.exports = router;
