var post_controller = function (post_model) {
  this.api_response = require(__dirname + '/../models/api_response.js');
  this.post_model = require(__dirname + '/../models/post_model.js');
}

//Retrieving user posts
post_controller.prototype.posts = function(id, callback) {
  var me = this;
  me.post_model.find({ author: id }).sort({ date: -1 }).find(function(err, docs) {
    if (err) {
      console.log(err);
    } if (docs) {
      return callback(err, new me.api_response({ success: true, extras: docs }));
    }
  })
}

post_controller.prototype.following = function(ids, callback) {
  var me = this;
  me.post_model.find({ _id: { $in: ids }}).sort({ date: -1 }).find(function(err, docs) {
    if (err) {
      console.log(err);
    } if (docs) {
      return callback(err, new me.api_response({ success: true, extras: docs }));
    }
  })
}

post_controller.prototype.by_id = function(id, callback) {
  var me = this;
  me.post_model.find({ _id: id }).sort({ date: -1 }).find(function(err, docs) {
    if (err) {
      console.log(err);
    } if (docs) {
      return callback(err, new me.api_response({ success: true, extras: docs }));
    }
  });
}

post_controller.prototype.save = function(post, callback) {
  post.save(function(err) {
    if (err) return handleError(res, req, err);
  });
}

module.exports = post_controller;
