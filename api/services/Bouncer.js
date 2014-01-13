
module.exports = function () {
	var routes = {};

	var param = function (req) {
		return function (name) {
			if (name == 'me') return req.session.user;
			return req.param(name);
		}
	}

	return {
		when: function (route, check) {
			routes[route] = check;
			return this;
		},

		bounce: function (req, res, next) {
			var check = routes[req.target.controller + '/' + req.target.action];

			if (check) {
				check(param(req), function (err, ok) {
					if (err) return res.serverError(err);
					if (ok) return next();
					return res.forbidden('api:403.error');
				});
			}

			return res.badRequest('api:404.error');
		}
	};
}