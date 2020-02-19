// Return the user obj given email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null;
};

// Fetch all urls that belong to single user
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

// Return boolean value for checking url's owner
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

// Generate random string given length
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
