'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var crypto = require('crypto');
var db = require('./models/db');
var user_model = require('./models/user_model');
var post_model = require('./models/post_model');
var user_controller = require('./controllers/user_controller');
var post_controller = require('./controllers/post_controller');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookieName: 'session',
  secret: '6XBkJZ9EKBt2Zvl2glUJvztcbcEWBxRT',
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.use('/', routes);

app.post('/register', function(req, res) {
  var uc = new user_controller(user_model);
  var user_salt = crypto.randomBytes(64).toString('base64'); //random salt
  uc.hash_pass(req.body.pass, user_salt, function(err, hashed) {
    if (err) {
      console.log('error hashing password.');
    } else {
      var new_user = new user_model({
        email: req.body.email,
        username: req.body.user,
        pass_hash: hashed,
        user_salt: user_salt
      });
      uc.register(new_user, function(err, response) {
        if (err) { console.log('Registration error.'); }
        if (response.success === true) {
          req.session.user = response.extras.msg;
          res.redirect('/')
        }
      })
    }
  });
})

app.post('/new', function(req, res) {
  if (req.session && req.session.user) {
    var uc = new user_controller(user_model, req.session);
    var pc = new post_controller(post_model);

    var tags = req.body.tags;
    var tags_array = [];
    tags = tags.replace(/ /g, '');
    for(var i in tags.split(',')) {
      tags_array[i] = tags.split(',')[i];
    }

    var post = new post_model({
      title: req.body.title,
      author: req.session.user.id,
      content: req.body.content,
      tags: tags_array,
    });

    uc.push(post);
    pc.save(post);
    req.session.user.post_count += 1;
    res.redirect('/login');
    //res.redirect('/');
  } else { res.redirect('/login'); }
})

app.post('/login', function(req, res) {
  if (req.session && req.session.user) {
    res.redirect('/');
  }
  var uc = new user_controller(user_model, req.session);
  uc.login(req.body.user, req.body.pass, function(err, profile) {
    if (err) {
      console.log('Login failed.');
      res.render('login', { error: profile.extras.msg });
    }
    if (profile.success === true) {
      req.session.user = profile.extras.msg;
      console.log('Login');
      console.log(req.session.user);
      res.redirect('/');
    } else {
      res.render('login', { title: 'Login', info: profile.extras.msg });
    }
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = process.env.PORT || 8000;
app.listen(port);
console.log('app');

module.exports = app;
