
module.exports = function (req, res, next) {
	return res.forbidden('home:403.error');
};
