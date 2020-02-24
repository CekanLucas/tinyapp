const getUserByEmail = function(email, database) {
  let user;
  for(let id in database){
    if(database[id].email === email){
      user = database[id];
      break;
    }
  }
  return user ? user : null;
};

module.exports = {getUserByEmail}