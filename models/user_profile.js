var user_profile = function(cnf) {
  this.id = cnf.id,
  this.email = cnf.email,
  this.username = cnf.username
  this.post_count = cnf.post_count,
  this.followers = cnf.followers,
  this.following = cnf.following
};

module.exports = user_profile;

//Notice that this profile does not contain any password related information
