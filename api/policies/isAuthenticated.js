
module.exports = function (req, res, next) {
	if (req.session.authenticated) return next();
	return res.forbidden('home:401.error');
};
