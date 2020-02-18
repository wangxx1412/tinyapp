const bcrypt = require("bcrypt");
const urlsForUser = (id, urlDatabase) => {
  let result = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      result[url] = urlDatabase[url]["longURL"];
    }
  }
  return result;
};

const checkUrl = (paramUrl, id, urlDatabase) => {
  for (const url in urlDatabase) {
    if (url === paramUrl) {
      if (urlDatabase[url]["userID"] !== id) {
        return false;
      }
    }
  }
  return true;
};

const checkUser = (loginUser, users) => {
  let result = {
    emailmatch: false,
    passwordmatch: false,
    code: 200,
    msg: "",
    id: "",
    match: false
  };
  for (const userId in users) {
    if (users[userId].email === loginUser.email) {
      result.emailmatch = true;
      const isMatch = bcrypt.compareSync(
        loginUser.password,
        users[userId].password
      );

      if (isMatch) {
        result.passwordmatch = true;
        result.id = userId;
        result.match = true;
        return result;
      } else {
        result.msg = "Password don't match.";
        result.code = 403;
        return result;
      }
    }
  }
  result.msg = "User not found.";
  return result;
};

const generateRandomString = leng => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + leng);
};

module.exports = { urlsForUser, checkUrl, checkUser, generateRandomString };
