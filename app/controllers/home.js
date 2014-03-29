// var mongoose = require('mongoose'),
//   Article = mongoose.model('Article');


exports.index = function(req, res){
  res.render('home/index', {
    title: 'Generator-Express MVC',
    user: req.user
  });
};

exports.err = function(req, res){
  res.render('404', {
    title: 'Generator-Express MVC',
    user: req.user
  });
};