
module.exports = {
	/*************************************************************************/
	/******************** R E S T F U L   V I E W S **************************/
	/*************************************************************************/

	getProfile: function (req, res) {
		res.view('user/profile', { user: req.session.user });
	},

	getSettings: function (req, res) {
		res.view('user/settings', { user: req.session.user });
	},

	postSettings: function (req, res) {
		User.findOneById(req.session.user.id, function (err, user) {
			if (err) return res.serverError(err);

			if (!user) return res.badRequest('home:user-not-found.error');

			user.dateFormat = req.param('dateFormat');

			user.save(function (err) {
				if (err) return res.serverError(err);

				req.session.user = user;
				return res.redirect('/user/profile');
			});
		});
	},

	/*************************************************************************/
	/********************** R E S T F U L   A P I ****************************/
	/*************************************************************************/

	find: function (req, res) {
		return res.json([]);
	},

	create: function (req, res) {
		// TODO: user create
		return res.serverError('Not Yet Implemented');
	},

	read: function (req, res) {
		User.findOneById(req.param('user')).done(function (err, user) {
			if (err) return res.serverError(err);
			if (!user) return res.badRequest('home:user-not-found.error');

			User.notify(req.socket, user);
			return res.json(user);
		});
	},

	update: function (req, res) {
		// TODO: user update
		return res.serverError('Not Yet Implemented');
	},

	destroy: function (req, res) {
		// TODO: user destroy
		return res.serverError('Not Yet Implemented');
	},

	me: function (req, res) {
		User.notify(req.socket, req.session.user);
		return res.json(req.session.user);
	}
};
