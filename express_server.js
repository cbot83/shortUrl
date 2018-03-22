var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

// Database of short and long urls
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// User Database
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

// creates a 6 character random string
function generateRandomString () {
  var shortUrl = "";
  // omitted I, O, l, 0, 1 to make string easier to dictate
  var char = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  for (let i = 0; i < 6; i++) {
    shortUrl += char.charAt(Math.floor(Math.random() * char.length));
  }
  return shortUrl;
}


// Searches users object vs parameter (use input email) for same email error
function findDuplicate (email) {
  let userKeys = [];
  let emailList = [];

  userKeys = Object.keys(users);

  for (var i = 0; i < userKeys.length - 1; i++) {
    emailList.push(users[userKeys[i]].email);
  }

  for (var j = 0; j < emailList.length; j++) {
    if (email === emailList[j]) {
      return emailList[j];
    }
  }
};


// Homepage
app.get("/", (req, res) => {
  res.end("Hello!");
});

// List of URL from Database
app.get("/urls", (req, res) => {
  let templateVars = {  urls: urlDatabase,
                        username: req.cookies["username"]
                        };
  res.render("urls_index", templateVars);
});

// Enter a URL form
app.get("/urls/new", (req, res) => {
  let templateVars = {  urls: urlDatabase,
                        username: req.cookies["username"]
                        };
  res.render("urls_new", templateVars);
});


// Post new url on submit and redirect to short version
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL
  res.redirect(`/urls/${randomString}`)
});

// Redirect the /u/ url to the original based on Database info
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Single URL on a page.
app.get("/urls/:id", (req, res) => {
   let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        username: req.cookies["username"] }
  res.render("urls_show", templateVars);
});

// Removes a url resourcs
app.post("/urls/:id/delete", (req, res) => {
  let templateVars = {  shortURL: req.params.id,
                        urls: urlDatabase };
  delete urlDatabase[req.params.id];
  res.redirect("/urls", templateVars);
});

// Updates a long url
app.post("/urls/:id", (req, res) => {
  // let templateVars = { shortURL: req.params.id,
  //                       urls: urlDatabase };

  // delete urlDatabase[req.params.id];
  res.redirect("/urls");
});



// Login Route
app.post("/login", (req, res) => {

  res.cookie('username', req.body.username);
  // console.log('Cookies: ', req.body.username);
  res.redirect("/urls");
})


// Logout Route in process
app.post("/logout", (req, res) => {

  res.clearCookie('username', req.body.username);
  // console.log('Cookies: ', req.body.username);
  res.redirect("/urls");
})


// Registration Page
app.get("/register", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        username: req.cookies["username"] }
  res.render("register", templateVars);
})



// Registration Post
app.post("/register", (req, res) => {
  // random string for cookie
  const randomUserId = generateRandomString();

  // creates newUser object with correct values
  let newUser = new Object();
    newUser['id'] = randomUserId;
    newUser['email'] = req.body.email;
    newUser['password'] = req.body.password;

  // puts new user object into global user object
  users[randomUserId] = newUser;

  // assigns cookie's user_id to it's randomly gen string
  res.cookie('user_id', newUser.id);

  // empty username or password returns error
  if (req.body.email === "" || req.body.password === "" ) {
    res.status(400).send('400 Error, you must fill out the fields.');
  }

  // duplicate email returns error
  if (req.body.email === findDuplicate(req.body.email)) {
    res.status(400).send('That email already exists!')
  }
  // sends back to /urls after submit
  else
    res.redirect("/urls");
})





// Can go to this url to check database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});





// Starts server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});