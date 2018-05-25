const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const Article = require('./models/article'); //Schema


mongoose.connect("mongodb://localhost/nodekb"); //local db

//APP configuration
app.use(express.static(path.join(__dirname, 'public'))); //public folder
app.set('views', path.join(__dirname, 'views')); //views folder
app.set('view engine', 'pug'); //view engine - pug
app.use(require("express-session")({ //login session
 secret: "Secret phrase",
 resave: false,
 saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Passport Config
require('./config/passport')(passport);
app.use(passport.initialize()); //passport
app.use(passport.session());

let articles = require('./routes/articles');
let users = require('./routes/users');

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', (req, res) => {
  Article.find({}, (err, articles) => {
    if(err){
      console.log(err);
    } else {
      res.render('index', {title:'Articles', articles: articles});
    }
  });
});

// Route Files
app.use('/articles', articles);
app.use('/users', users);

// Start Server
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});
