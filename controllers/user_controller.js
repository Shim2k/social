var user_controller = function(user_model, session) {
  this.crypto = require('crypto');
  this.uuid = require('node-uuid');
  this.user_model = user_model;
  this.session = session;
  this.api_response = require(__dirname + '/../models/api_response.js');
  this.user_profile = require(__dirname + '/../models/user_profile.js');
  this.user_model = require(__dirname + '/../models/user_model.js');
}

//Getting all users from the database
user_controller.prototype.all_users = function(callback) {
  var me = this;
  me.user_model.find().sort({date: -1}).find(function (err, users) {
    if (err) {
      return callback(err, new me.api_response({
        success: false, extras: { msg: 'DB_ERROR' }
      }))
    }
    if (users) {
      return callback(err, new me.api_response({
        success: true, extras: { msg: users },
      }))
    }
  });
}

user_controller.prototype.following = function(name, callback) {
  var me = this;
  name = name || 0;
  if (name !== 0) {
    var username = name;
  } else {
    var username = this.session.user.username;
  }
  me.user_model.findOne({ username: username }, 'following_name', function (err, user) {
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

user_controller.prototype.followers = function(name, callback) {
  var me = this;
  name = name || 0;
  if (name !== 0) {
    var username = name;
  } else {
    var username = this.session.user.username;
  }
  me.user_model.findOne({ username: username }, 'followers_name', function (err, user) {
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
          if (user.following.indexOf(to_follow._id) < 0) {
            user.update({ $push: { "following" : to_follow, "following_name" : to_follow.username }, $inc: { following_count: 1 }}, function(err, follower) {
              if (follower.nModified) {
                to_follow.update({ $push: { "followers" : user, "followers_name": user.username }, $inc: { followers_count: 1 }}, function(err, user) {
                  if (user.nModified) {
                    return callback(err, new me.api_response({
                      success: true, extras: { msg: to_follow.username },
                    }));
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
            console.log('user.following');
            console.log(user.following);

            var uf = user.following ? user.following.indexOf(to_follow._id) : -1;
            // is it valid?
            console.log('idx');
            console.log(uf);
            if (uf !== -1) {
              var uf_name = user.following_name ? user.following_name.indexOf(to_follow.username) : -1;
              console.log('idx_name');
              console.log(uf_name);
              if (uf_name !== -1) {
                user.following.splice(uf, 1);
                user.following_name.splice(uf_name, 1);
                var tf = to_follow.followers ? to_follow.following.indexOf(user._id) : -1;
                if (tf !== -1) {
                  var tf_name = to_follow.followers_name ? to_follow.following_name.indexOf(user.username) : -1;
                  if (tf_name !== -1) {
                    console.log('to_follow.followers_name');
                    console.log(to_follow.followers_name);
                    to_follow.followers.splice(tf, 1);
                    to_follow.followers_name.splice(tf_name, 1);
                    console.log(to_follow.followers_name);
                    user.save(function(err) {
                      if (err) return handleError(res, req, err);
                    });
                    to_follow.save(function(err) {
                      if (err) return handleError(res, req, err);
                    });
                  }
                }
              }              
            }
            return callback(err, new me.api_response({
              success: true, extras: { msg: to_follow.username },
            }));
            // user.update({ $pull: { "following" : to_follow, "following_name" : to_follow.username }, $inc: { following_count: -1 }}, function(err, follower) {
            //   if (follower.nModified) {
            //     to_follow.update({ $push: { "followers" : user, "followers_name": user.username }, $inc: { followers_count: -1 }}, function(err, user) {
            //       if (user.nModified) {
            //         return callback(err, new me.api_response({
            //           success: true, extras: { msg: to_follow.username },
            //         }));
            //       }
            //     });
            //   }
            // });
            // return callback(err, new me.api_response({
            //   success: false, extras: { msg: ['Already follows.', to_follow.username] }
            // }))
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
  var username = String(name);
  me.user_model.findOne({ username: username }, function (err, user) {
    if (user) {
      return callback(err, new me.api_response({
        success: true, extras: { msg: user },
      }))
    } else {
      return callback(err, new me.api_response({
        success: false, extras: { msg: 'Could not find user.' }
      }));
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
          var picture = user.picture || 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50';
          var profile = new me.user_profile({
            id: user._id,
            email: user.email,
            username: user.username,
            picture: picture,
            post_count: user.post_count,
            followers: user.followers_name,
            following: user.following_name,
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
          //var picture = user.picture;
          var user_profile = new me.user_profile({
            id: user._id,
            email: user.email,
            username: user.username,
            picture: user.picture,
            post_count: user.post_count,
            followers: user.followers_name,
            following: user.following_name,
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
