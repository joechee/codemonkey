
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.play = function(req, res){
  res.render('play', { title: 'Express' });
};