var express = require('express');
var user_model = require('../models/user_model');
var post_model = require('../models/post_model');
var user_controller = require('../controllers/user_controller');
var post_controller = require('../controllers/post_controller');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session && req.session.user) {
    var pc = new post_controller(post_model);
    if (pc) {
      pc.posts(req.session.user.id, function(err, posts) {
        if (err) { console.log(err); }
        if (posts) {
          res.render('index', { title: 'Express', session: req.session.user, user: req.session.user, posts: posts.extras });
        }
      });
    } else {
      res.render('index', { user: req.session.user });
    }
  } else {
    res.redirect('/login');
  }
});

router.get('/new', function(req, res, next) {
  if (req.session && req.session.user) {
    res.render('new_post', { title: 'New Post', user: req.session.user });
  } else {
    res.redirect('/');
  }
});

router.get('/following', function(req, res) {
  if (req.session && req.session.user) {
    var uc = new user_controller(user_model, req.session);
    if (uc) {
      uc.following(function(err, following) {
        if (err) { console.log(err); }
        if (following) {
          following = following.extras.msg.following;
          res.render('following', { following: following });
        }
      })
    }
  }
})

router.get('/followers', function(req, res) {
  if (req.session && req.session.user) {
    var uc = new user_controller(user_model, req.session);
    if (uc) {
      uc.followers(function(err, followers) {
        if (err) { console.log(err); }
        if (followers) {
          followers = followers.extras.msg.followers;
          res.render('followers', { followers: followers });
        }
      })
    }
  }
})

router.get('/user=:id/follow', function(req, res) {
  var uc = new user_controller(user_model, req.session);
  if (req.session && req.session.user) {
    if (req.query.value === 'yes') {
      uc.follow(req.params.id, function(err, docs) {
        console.log(docs);
        if (docs.success === true) {
          req.session.user.following += 1;
          res.redirect('/user=' + req.params.id);
        } else { res.redirect('/'); }
      });
    } else { res.redirect('/'); }
  }
      // uc.name(req.params.id, function(err, user) {
      //   if (err) { console.log(err); }
      //   if (user) {
      //     uc.follow(user, function(err, docs) {
      //       if (err) { console.log(err); }
      //       console.log(docs);
      //       if (docs.success === 'true') {
      //         console.log('?');
      //         res.redirect('/user=:id');
      //       }
      //     });
      //   }
      // })
});

router.get('/login', function(req, res, next) {
  if (req.session && req.session.user) {
    res.redirect('/');
  } else {
    req.session.reset();
    res.render('login', { title: 'Login', info: '' });
  }
});

router.get('/user=:id', function(req, res) {
  var uc = new user_controller(user_model);
  var pc = new post_controller(post_model);
  if (uc) {
    uc.name(req.params.id, function(err, user) {
      if (err) {
        console.log(err);
      }
      if (user) {
        user = user.extras.msg;
        if (pc) {
          pc.posts(user.id, function(err, posts) {
            if (err) { console.log(err); }
            if (posts) {
              res.render('index', { title: req.session.user.username, user: user, posts: posts.extras, session: req.session.user });
            }
          });
        }
      }
    });
  }
})

router.get('/post=:id', function(req, res) {
  var pc = new post_controller(post_model);
  if (pc) {
    pc.by_id(req.params.id, function(err, post) {
      if (post) {
        if (req.session && req.session.user) {
          res.render('post', { user: req.session.user, posts: post.extras });
        } else {
          res.render('post', { posts: post.extras });
        }
      }
    })
  }
})

router.get('/logout', function(req, res, next) {
  if (req.query.value === 'yes') {
    req.session.reset();
  }
  if (req.session && req.session.user) {
    res.render('index', { user: req.session.user.username });
  } else {
    res.redirect('/');
  }
})

router.get('/register', function(req, res, next) {
  if (req.session && req.session.user) {
    res.redirect('/');
  } else {
    req.session.reset();
    res.render('register', { title: 'Register', user: req.session.user });
  }
});

module.exports = router;
