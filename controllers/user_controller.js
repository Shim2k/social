var user_controller = function(user_model, session) {
  this.crypto = require('crypto');
  this.uuid = require('node-uuid');
  this.user_model = user_model;
  this.session = session;
  this.api_response = require(__dirname + '/../models/api_response.js');
  this.user_profile = require(__dirname + '/../models/user_profile.js');
  this.user_model = require(__dirname + '/../models/user_model.js');
}

// user_controller.prototype.by_id = function (list, callback) {
//   var me = this;
//   if (list.length == )
//   me.user_model.findOne({ _id: id }, function (err, user) {
//     if (err) {
//       return callback(err, new me.api_response({
//         success: false, extras: { msg: 'Could not find user.' }
//       }))
//     }
//     if (user) {
//       return callback(err, new me.api_response({
//         success: true, extras: { msg: user },
//       }))
//     }
//   });
// }

user_controller.prototype.following = function(callback) {
  var me = this;
  me.user_model.findOne({ username: this.session.user.username }, 'following', function (err, user) {
    if (err) {
      return callback(err, new me.api_response({
        success: false, extras: { msg: 'Could not find user.' }
      }))
    } if (user) {
      return callback(err, new me.api_response({
        success: true, extras: { msg: user },
      }))
    }
  })
}

user_controller.prototype.followers = function(callback) {
  var me = this;
  me.user_model.findOne({ username: this.session.user.username }, 'followers', function (err, user) {
    if (err) {
      return callback(err, new me.api_response({
        success: false, extras: { msg: 'Could not find user.' }
      }))
    } if (user) {
      return callback(err, new me.api_response({
        success: true, extras: { msg: user },
      }))
    }
  })
}

user_controller.prototype.follow = function(user_to_follow, callback) {
  var me = this;
  me.user_model.findOne({ username: this.session.user.username }, function(err, user) {
    if (err) {
      return callback(err, new me.api_response({
        success: false, extras: { msg: 'Could not find user.' }
      }))
    } if (user) {
        me.user_model.findOne({ username: user_to_follow }, function(err, to_follow) {
          if (err) {
            return callback(err, new me.api_response({
              success: false, extras: { msg: 'Could not find user.' }
            }))
          }
          if (to_follow) {
            console.log('user');
            console.log(user);
            if (user.following.indexOf(to_follow._id) < 0) {
              user.update({ $push: { "following" : to_follow }, $inc: { following_count: 1 }}, function(err, follower) {
                if (follower.nModified) {
                  to_follow.update({ $push: { "followers" : user }, $inc: { followers_count: 1 }}, function(err, user) {
                    if (user.nModified) {
                      return callback(err, new me.api_response({
                        success: true, extras: { msg: 'Following.' },
                      }))
                    } else {
                      return callback(err, new me.api_response({
                        success: false, extras: { msg: 'Error following user.' }
                      }))
                    }
                  });
                } else {
                  return callback(err, new me.api_response({
                    success: false, extras: { msg: 'Error following user.' }
                  }))
                }
              });
            } else {
              return callback(err, new me.api_response({
                success: false, extras: { msg: 'Already follows.' }
              }))
            }
          } else {
            return callback(err, new me.api_response({
              success: false, extras: { msg: 'Could not find user.' }
            }))
          }
        });
      } else {
        return callback(err, new me.api_response({
          success: false, extras: { msg: 'Could not find user.' }
        }))
      }
    })
  }

user_controller.prototype.name = function (name , callback) {
  var me = this;
  me.user_model.findOne({ username: name }, function (err, user) {
    if (err) {
      return callback(err, new me.api_response({
        success: false, extras: { msg: 'Could not find user.' }
      }))
    }
    if (user) {
      return callback(err, new me.api_response({
        success: true, extras: { msg: user },
      }))
    }
  });
}

user_controller.prototype.push = function(post, callback) {
  var me = this;
  me.user_model.findOne({ username: this.session.user.username}, function (err, user) {
    if (err) {
      return callback(err, new me.api_response({
        success: false, extras: { msg: 'Could not find user.' }
      }))
    }
    if (user) {
      user.update({ $push: { "posts" : post }, $inc: { post_count: 1 }}, function(err) {});
    }
  });
}

user_controller.prototype.register = function (new_user, callback) {
  var me = this;
  me.user_model.findOne({ username: new_user.username }, 'username', function (err, user) {
    if (err) {
      return callback(err, new me.api_response({
        success: false, extras: { msg: 'DB_ERROR' }
      }));
    }
    if (user) {
      return callback(err, new me.api_response({
        success: false, extras: { msg: 'USER_ALREADY_EXISTS' }
      }));
    } else {
      new_user.save(function (err, user, numberAffected) {
        if (err) {
          return callback(err, new me.api_response({
            success: false, extras: { msg: 'DB_ERROR' }
          }))
        }
        if (numberAffected == 1) {
          var profile = new me.user_profile({
            id: user._id,
            email: user.email,
            username: user.username,
            post_count: user.post_count,
            followers: user.followers,
            following: user.following,
          })
          return callback(err, new me.api_response({
            success: true, extras: { msg: profile },
          }))
        } else {
          return callback(err, new me.api_response({
            success: false, extras: { msg: 'COULD_NOT_CREATE_USER' }
          }))
        }
      })
    }
  })
}

user_controller.prototype.login = function (username, password, callback) {
  var me = this;
  me.user_model.findOne({ username: username }, function(err, user) {
    if (err) {
      //pass an api_response
      return callback(err, new me.api_response({
        success: false,
        extras: { msg: 'Could not find user.' }
      }))
    }
    if (user) {
      me.hash_pass(password, user.user_salt, function(err, hashed) {
        if (err) { console.log('Error hashing password'); }
        if (String(hashed) === user.pass_hash) {
          var user_profile = new me.user_profile({
            id: user._id,
            email: user.email,
            username: user.username,
            post_count: user.post_count,
            followers: user.followers,
            following: user.following,
          });
          return callback(err, new me.api_response({
            success: true,
            extras: { msg: user_profile }
          }));
        } else {
          return callback(err, new me.api_response({
            success: false,
            extras: { msg: 'INVALID_PWD' }
          }))
        }
      })
    } else {
        return callback(err, new me.api_response({
          success: false,
          extras: { msg: 'User not found' }
        }));
      }
  })
}

user_controller.prototype.hash_pass = function (password, salt, callback) {
  var iterations = 1000,
  key_length = 64;
  this.crypto.pbkdf2(password, salt, iterations, key_length, callback);
};

module.exports = user_controller;
