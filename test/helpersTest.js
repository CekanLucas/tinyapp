const { assert } = require('chai');

const { getUserByEmail } = require('../functions/helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.isTrue(user.id === expectedOutput);
  });
  it('should return undefind for non-existant user', function() {
    const user = getUserByEmail("nonexistant@example.com", testUsers);
    assert.isNull(user);
  });
});
