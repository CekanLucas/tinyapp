const express = require("express");
const app = express();
const cookie = require('cookie-parser')

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}


function generateRandomString() {
  let charArray = [];
  
  let i = 48 
  while(i < 58){ // generate digits
    charArray.push(String.fromCharCode(i));
    i++;
  }
  i = 65;
  while(i < 91){ // generate uppercase
    charArray.push(String.fromCharCode(i));
    i++;
  }
  i = 97;
  while(i < 123){ // generate lowercase
    charArray.push(String.fromCharCode(i));
    i++;
  }
  
  i = 0 
  let randStr = ''
  while(i < 6){
    //charArray.length is 62
    randStr += charArray[Math.floor(Math.random() * 62)];
    i++;
  }
  return randStr;
}


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookie());

const formHandling = (request, response) => {
  // 2 paths login and registration 
  // State 1: input: email button1: login  button2: register
  // State 2: input: pass  button1: submit button2: back
  // State 3: input: none  button1: logout button2: none

  //using cookie value to determine state
  const email    = request.cookies.email_validated;
  const pass     = request.cookies.pass_validated;
  const register = request.cookies.registration;

  // console.log('Doing formHandling', request.cookies)
  // console.log(email === false && pass === false)

  if(email === 'false' && pass === 'false'){ //State 1: ask for email
    for(id in users){
      // console.log(id, users)
      if (request.body.loginEmail === users[id].email){
        response.cookie('user_id', id);
        console.log(id + ' id')
        response.cookie('email_validated','true');
        return;
      }
    }
    response.cookie('email_validated','false')
    response.status(401).send('email is not registered');
  }

  else if(email === 'true' && pass === 'false'){ //State 2: ask for password
    for(id in users){
      if (request.body.loginPass === users[id]){
        response.cookie('email_validated','true');
      }
    }
    response.status(401).send('invalid password');
  } else{return}
}


// -- Routing -- 

//redirect to urls and set default cookies
app.get("/", (req, res) => {
  res.cookie('email_validated','false');
  res.cookie('pass_validated','false');
  res.cookie('registration','false');
  res.redirect('http://localhost:8080/urls');
})

// render templateVars to urls_index
app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  console.log(userID)
  let templateVars = { urls: urlDatabase, userID, users, loginEmail:'', 
  email_validated: false, 
  pass_validated:  false, 
  registration:    false,
};

// formHandling(req, res);
console.log('test ', users[templateVars[userID]])

// update templateVars with cookie values and change to boolean
  templateVars.email_validated  = req.cookies.email_validated === 'true' ? true:false;
  templateVars.pass_validated   = req.cookies.pass_validated === 'true' ? true:false;
  templateVars.registration     = req.cookies.registration === 'true' ? true:false;
  
  // console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get('/register', (req, res) => {
  res.render('urls_form',users);
})

app.post('/register', (req, res) => {
  const randUserId = `${generateRandomString()}${generateRandomString()}`;
  console.log('registration handling')
  for(id in users){
    if(users[id].email === req.body.email) {
      console.log('email already exists')
      res.sendStatus(404);
    }
  }
  if(!req.body.email || !req.body.password){
    console.log('email or pass not filled ')
    res.sendStatus(404);
    res.redirect('http://localhost:8080/register');
  }
  else{
    users[randUserId] = {
      id: randUserId,
      email: req.body.email, 
      password: req.body.password
    }
    res.cookie('user_id', randUserId);
    res.redirect('http://localhost:8080/urls');
  }
})

app.post("/login", (req, res)=> { //WIP
  const loginEmail = req.body.loginEmail;
  const loginPass  = req.body.loginPass;

  // console.log('LE ',loginEmail === '')
  // console.log('LP ',loginPass === undefined)

  // handle empty login or password field
  if(loginEmail === '' && loginPass === undefined){
    res.status(403).send('Please fill out email field');
    return;
  }
  if(loginEmail === undefined && loginPass === ''){
    res.status(403).send('Please fill out password field');
    return;
  }
  
  formHandling(req, res);
  
  // if(req.cookies.email_validated !== 'true'){
  //   res.status(403).send('User could not be found');
  //   return;
  // }
console.log('redirecting '+req.cookies)
res.redirect('http://localhost:8080/urls')
});

// go from state 3 to state 1
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.cookie('email_validated', false);
  res.cookie('pass_validated', false);
  res.cookie('registration', false);
  res.redirect(`http://localhost:8080/urls`);
});

// when you click urls new in header
app.get("/urls/new", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_id;
  const cookie = req.cookies.userID;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], cookie, users, userID, validated:false};
  res.render("urls_show", templateVars);
});

// redirect to longurl when you click short url
app.get("/u/:shortURL", (req, res) => {
  let longURL =  urlDatabase[req.params.shortURL];
  if(!longURL){
    res.send(404,'Short URL does not lead to a site\n')
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = req.body.longURL;
  const cookie = req.cookies.user_id;
  urlDatabase[shortURL] = longURL;
  res.render("urls_show",{longURL, shortURL, cookie})
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect(`http://localhost:8080/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
