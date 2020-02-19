const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (id, urlDatabase) => {
  let result = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      const dateStr =
        (urlDatabase[url]["created"].getMonth() + 1).toString() +
        "/" +
        urlDatabase[url]["created"].getDate() +
        "/" +
        urlDatabase[url]["created"].getFullYear();
      result[url] = {
        longURL: urlDatabase[url]["longURL"],
        created: dateStr
      };
    }
  }
  return result;
};

const checkUrlOwner = (paramUrl, id, urlDatabase) => {
  for (const url in urlDatabase) {
    if (url === paramUrl) {
      if (urlDatabase[url]["userID"] !== id) {
        return false;
      }
    }
  }
  return true;
};

const generateRandomString = leng => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + leng);
};

module.exports = {
  urlsForUser,
  checkUrlOwner,
  generateRandomString,
  getUserByEmail
};
