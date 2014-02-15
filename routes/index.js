
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index');
};


exports.play = function(req, res){
	console.log(req.query.name);
  	res.render('play', { name: req.query.n });
};

exports.testsocket = function(req, res) {
    res.render('testsocket');
};