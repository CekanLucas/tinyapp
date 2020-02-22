
const formHandling = (request, response) => {
  const {users, urlDatabase} = require('../express_server');
  // console.log('users: '+users);
  // 2 paths login and registration 
  // State 1: input: email button1: login  button2: register
  // State 2: input: pass  button1: submit button2: back
  // State 3: input: none  button1: logout button2: none

  //using cookie value to determine state
  const email    = request.cookies.email_validated;
  const pass     = request.cookies.pass_validated;
  const register = request.cookies.registration;
  // console.log('Users:\t'+users)
  console.log('cookies;\t'+email,pass)
  if(email === 'false' && pass === 'false'){ //State 1: ask for email
    for(id in users){
      console.log(id, users[id].email)
      if (request.body.loginEmail === users[id].email){
        response.cookie('user_id', id);
        console.log(id + ' id')
        response.cookie('email_validated','true');
        response.redirect('http://localhost:8080/urls')
      }
    }
    response.cookie('email_validated','false')
    response.status(401).send('email is not registered');
  }

  else if(email === 'true' && pass === 'false'){ //State 2: ask for password
    for(id in users){
      if (request.body.loginPass === users[id].password){
        response.cookie('pass_validated','true');
        response.redirect('http://localhost:8080/urls')
      }
    }
    response.status(401).send('invalid password');
  } else{response.redirect('http://localhost:8080/urls')}
}

module.exports = {
  formHandling
}