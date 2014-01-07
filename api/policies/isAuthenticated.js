
module.exports = function (req, res, next) {
	if (req.session.authenticated) return next();
	return res.forbidden('not-authenticated');

	/*User.findOneById(1).done(function (err, user) {
		req.session.authenticated = true;
		req.session.user = user;

		if (req.session.authenticated) return next();
		return res.forbidden('not-authenticated');
	});*/
};
