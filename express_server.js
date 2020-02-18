const express = require("express");
const app = express();

const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let charArray = []
  
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL =  urlDatabase[req.params.shortURL];
  if(!longURL){
    res.send(404,'Short URL does not lead to a site\n')
  }
  res.redirect(longURL);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req)
  // console.log(urlDatabase);
  res.redirect(`http://localhost:8080/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  console.log(shortURL)
  urlDatabase[shortURL] = req.body.longURL;
  res.render("urls_show", req.body.longURL)
  console.log('Test',urlDatabase, shortURL, req.body.longURL);
  // res.redirect(`http://localhost:8080/urls`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  // console.log(urlDatabase, shortURL);
  delete urlDatabase[shortURL];
  res.redirect(`http://localhost:8080/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/*    --- NOTES --- 

<!-- This would display the string "Hello World!" -->
<h1><%= greeting %></h1>

<!-- This line will not show up on the page -->
<% if(greeting) {%>
  <!-- This line will only show if greeting is truthy -->
  <h1><%= greeting %></h1>
<% }%>


*/
