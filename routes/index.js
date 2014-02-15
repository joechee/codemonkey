
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index');
};


exports.play = function(req, res){
	var name = req.query.n ? req.query.n : 'Monkey';
  	res.render('play', { name: name });
};

exports.testsocket = function(req, res) {
    res.render('testsocket');
};