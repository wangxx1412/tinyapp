const { assert } = require("chai");

const { getUserByEmail, urlsForUser, checkUrl } = require("../helpers/index");

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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "dsj4lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "43d8lW" }
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
    const expectedOutput = { b6UTxQ: "https://www.tsn.ca" };
    assert.deepEqual(result, expectedOutput);
  });
  it("should return an empaty object given an unexist userID", function() {
    const result = urlsForUser("dswdedwlW", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(result, expectedOutput);
  });
});

describe("checkUrl", function() {
  it("should return true given owner's id and his url", function() {
    const result = checkUrl("b6UTxQ", "dsj4lW", urlDatabase);
    assert.equal(result, true);
  });
  it("should return false given url not belongs to user", function() {
    const result = checkUrl("b6UTxQ", "43d8lW", urlDatabase);
    assert.equal(result, false);
  });
});
