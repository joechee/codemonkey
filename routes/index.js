
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.testsocket = function(req, res) {
    res.render('testsocket');
};