
const formHandling = (request, response) => {
  const {users, urlDatabase} = require('../express_server');
  const bcrypt = require('bcrypt');
  // console.log('users: '+users);
  // 2 paths login and registration 
  // State 1: input: email button1: login  button2: register
  // State 2: input: pass  button1: submit button2: back
  // State 3: input: none  button1: logout button2: none

  //using cookie value to determine state
  const email    = request.session.email_validated;
  const pass     = request.session.pass_validated;
  const register = request.session.registration;
  
  //State 1: ask for email
  if(JSON.parse(email) === false && JSON.parse(pass) === false){ 
    for(id in users){
      if (request.body.loginEmail === users[id].email){
        request.session.user_id = id;
        request.session.email_validated = 'true';
        response.redirect('http://localhost:8080/urls')
        return;
      }
    }
    response.status(401).send('Email is not registered');
    response.redirect('http://localhost:8080/urls');
    return;
  }

  else if(email === 'true' && pass === 'false'){ //State 2: ask for password
    const id = request.session.user_id;
    if (bcrypt.compareSync(request.body.loginPass, users[id].hash)){
      request.session.pass_validated = 'true';
      response.redirect('http://localhost:8080/urls')
    }
    else{response.status(401).send('invalid password')};
  } else{response.redirect('http://localhost:8080/urls')}
}

module.exports = {
  formHandling
}