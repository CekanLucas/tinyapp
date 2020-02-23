const session = require('cookie-session');
const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const {generateRandomString} = require('./functions/generateRandomString');
const {formHandling} = require('./functions/formHandling');
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" },
  b2xVn2:  { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK":  { longURL: "http://www.google.com", userID: "user2RandomID" },
};

//add hashable passwords
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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  name: 'session',
  secret: 'secret key',
}));

// -- Routing -- 

//redirect to urls and set default cookies
app.get("/", (req, res) => {
  req.session.email_validated = 'false';
  req.session.pass_validated = 'false';
  req.session.registration = 'false';
  // req.user_id = null;
  res.redirect('http://localhost:8080/urls');
})

// render templateVars to urls_index
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const email_validated= req.session.email_validated === 'true' ? true:false;
  const pass_validated = req.session.pass_validated === 'true' ? true:false;
  const registration   = req.session.registration === 'true' ? true:false;
  
  console.log('usrID\t' + req.session.user_id);
  let URL = {};
  if(userID !== null && email_validated === true && pass_validated === true){
    for(let url in urlDatabase){
      console.log(URL[url], userID)
      if( urlDatabase[url].userID === userID ){
        console.log('Added!')
        URL[url] = urlDatabase[url];
      }
    }
  }
  let templateVars = { urls: URL, userID, users, loginEmail:'', 
    email_validated, pass_validated, registration   
  };

  console.log(URL)
  
  // console.log(templateVars.userID)
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
    const password = req.body.password;
    const hash = bcrypt.hashSync(password, 10);
    users[randUserId] = {
      id: randUserId,
      email: req.body.email, 
      hash
    }
    // console.log(users)
    req.session.user_id = randUserId;
    res.redirect('http://localhost:8080/urls');
  }
})

app.post("/login", (req, res)=> { 
  const loginEmail = req.body.loginEmail;
  const loginPass  = req.body.loginPass;
  console.log('UserID', req.session.user_id)
  if(loginEmail === '' && loginPass === undefined){
    res.status(403).send('Please fill out email field');
    return;
  }
  if(loginEmail === undefined && loginPass === ''){
    res.status(403).send('Please fill out password field');
    return;
  }
  formHandling(req, res);
  console.log('UserID', req.session.user_id)
});

// go from state 3 to state 1
app.post("/logout", (req, res) => {
  req.session.email_validated = false;
  req.session.pass_validated = false;
  req.session.registration = false;
  req.session.user_id = null;
  res.redirect(`http://localhost:8080/urls`);
});

// when you click urls new in header
app.get("/urls/new", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  const longURL = req.body.longURL
  urlDatabase[shortURL] = {userID, longURL};
  
  if(
    req.session.email_validated === 'true' && 
    req.session.pass_validated  === 'true'){
    res.redirect(`http://localhost:8080/urls/${shortURL}`);
  }
  else{ res.status(401).send('Please register and/or login to create short urls')}
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users, userID, validated:false};

  // update templateVars with cookie values and change to boolean
  templateVars.email_validated = req.session.email_validated === 'true' ? true:false;
  templateVars.pass_validated  = req.session.pass_validated === 'true' ? true:false;
  templateVars.registration    = req.session.registration === 'true' ? true:false;

  if(!templateVars.email_validated || !templateVars.pass_validated || 
     templateVars.email_validated === false || templateVars.pass_validated === false){
    console.log('non logged in users cant exit');
    res.send(401, 'Only logged in users can edit');
    res.redirect('/urls');
    return;
  }
  // logged in user not found
  // console.log('TESTING ',templateVars.email_validated, users[userID], users)
  res.render("urls_show", templateVars);
});

// redirect to longurl when you click short url
app.get("/u/:shortURL", (req, res) => {
  let longURL =  urlDatabase[req.params.shortURL].longURL;
  if(!longURL){
    res.send(404,'Short URL does not lead to a site\n')
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  // console.log(req.cookies)
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL
  const longURL = req.body.longURL;
  const email_validated = req.session.pass_validated === 'true' ? true:false;
  const pass_validated =  req.session.email_validated === 'true' ? true:false;
  const templateVars =
  {longURL, shortURL, email_validated, pass_validated, userID, users};
  urlDatabase[shortURL] ={ longURL, userID };
  res.render("urls_show",templateVars)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect(`http://localhost:8080/urls`);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});

module.exports = {
  users,
  urlDatabase
}