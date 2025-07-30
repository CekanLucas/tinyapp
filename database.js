const bcrypt = require('bcrypt');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" },
  b2xVn2:  { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK":  { longURL: "http://www.google.com", userID: "user2RandomID" },
};

//added hashable passwords to example users
const hash1 = bcrypt.hashSync("example", 10)
const hash2 = bcrypt.hashSync("abc", 10)

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    hash: hash1
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    hash: hash2
  }
}

module.exports = {
  users,
  urlDatabase
};
