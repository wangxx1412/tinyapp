const { assert } = require("chai");

const {
  getUserByEmail,
  urlsForUser,
  checkUrlOwner
} = require("../helpers/index");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "dsj4lW",
    created: new Date(2018, 11, 24, 10, 33, 30, 0)
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "43d8lW",
    created: new Date(2018, 11, 24, 10, 33, 30, 0)
  }
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it("should return undefined with an unexisted email", function() {
    const user = getUserByEmail("useewewr@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe("urlsForUser", function() {
  it("should return an object contains longURL given existed userID", function() {
    const result = urlsForUser("dsj4lW", urlDatabase);
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        created: "12/24/2018"
      }
    };
    assert.deepEqual(result, expectedOutput);
  });
  it("should return an empaty object given an unexist userID", function() {
    const result = urlsForUser("dswdedwlW", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(result, expectedOutput);
  });
});

describe("checkUrlOwner", function() {
  it("should return true given owner's id and his url", function() {
    const result = checkUrlOwner("b6UTxQ", "dsj4lW", urlDatabase);
    assert.equal(result, true);
  });
  it("should return false given url not belongs to user", function() {
    const result = checkUrlOwner("b6UTxQ", "43d8lW", urlDatabase);
    assert.equal(result, false);
  });
});
