const session = require('cookie-session');
const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const {generateRandomString} = require('./functions/generateRandomString');
const {formHandling} = require('./functions/formHandling');
const {getUserByEmail} = require('./functions/helpers');
const PORT = 8080;

app.set('view engine', 'ejs');

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
  const email_validated= JSON.parse(req.session.email_validated);
  const pass_validated = JSON.parse(req.session.pass_validated);
  const registration   = JSON.parse(req.session.registration);
  let URL = {};
  if(userID !== null && email_validated === true && pass_validated === true){
    for(let url in urlDatabase){
      if( urlDatabase[url].userID === userID ){
        URL[url] = urlDatabase[url];
      }
    }
  }
  let templateVars = { urls: URL, userID, users, loginEmail:'', 
    email_validated, pass_validated, registration   
  };

  res.render("urls_index", templateVars);
});

app.get('/register', (req, res) => {
  res.render('urls_form',users);
})

// registration handling
app.post('/register', (req, res) => {
  const randUserId = `${generateRandomString()}${generateRandomString()}`;

  if(!req.body.email || !req.body.password){
    res.status(404).send('email or password field not filled ');
  }
  else if (Boolean(getUserByEmail(req.body.email, users)) === false){
    const password = req.body.password;
    const hash = bcrypt.hashSync(password, 10);
    users[randUserId] = {
      id: randUserId,
      email: req.body.email, 
      hash
    }
    req.session.user_id = randUserId;
    req.session.email_validated = 'true';
    req.session.pass_validated = 'true';
    res.redirect('http://localhost:8080/urls');
  }
  else {
    res.status(404).send('user already exists!');
  }
})

app.post("/login", (req, res)=> { 
  const loginEmail = req.body.loginEmail;
  const loginPass  = req.body.loginPass;
  if(loginEmail === '' && loginPass === undefined){
    res.status(403).send('Please fill out email field');
    return;
  }
  if(loginEmail === undefined && loginPass === ''){
    res.status(403).send('Please fill out password field');
    return;
  }
  formHandling(req, res);
});

// go from state 3 to state 1
app.post("/logout", (req, res) => {
  req.session.email_validated = false;
  req.session.pass_validated = false;
  req.session.registration = false;
  req.session.user_id = null;
  res.redirect(`http://localhost:8080/urls`);
});

// when you click urls new in header create new url
app.get("/urls/new", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  const longURL = req.body.longURL
  urlDatabase[shortURL] = {userID, longURL};
  if(
    JSON.parse(req.session.email_validated) === true && 
    JSON.parse(req.session.pass_validated)  === true){
    res.redirect(`http://localhost:8080/urls/${shortURL}`);
    return;
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
    res.send(401, 'Only logged in users can edit');
    res.redirect('/urls');
    return;
  }
  res.render("urls_show", templateVars);
});

// redirect to longurl when you click short url
app.get("/u/:shortURL", (req, res) => {
  let longURL =  urlDatabase[req.params.shortURL].longURL;
  if(!longURL){
    res.status(404).send('Short URL does not lead to a site\n');
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls`);
});

// render the url_show
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

// delete url
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