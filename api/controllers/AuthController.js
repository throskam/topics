var url = require('url');

module.exports = {
	/*************************************************************************/
	/******************** R E S T F U L   V I E W S **************************/
	/*************************************************************************/

	getSignin: function (req, res) {
		res.view('auth/signin', { query: (url.parse(req.originalUrl).query || '') });
	},

	postSignin: function (req, res) {
 		var username = req.param('username');
		var password = req.param('password');

		var redirectTo = req.param('redirect_to');
		var retry = 'auth/signin' + (redirectTo ? '?redirect_to=' + redirectTo : '');


		if (!username) {
			req.flash('danger', Formatter.custom('auth:empty.error', ['username']));
			return res.redirect(retry);
		}

		if (!password) {
			req.flash('danger', Formatter.custom('auth:empty.error', ['password']));
			req.flash('input', req.body);
			return res.redirect(retry);
		}

		User.findOne({username: username}).done(function (err, user) {
			if (err) return res.serverError(err);

			if (!user) {
				req.flash('danger', Formatter.custom('auth:username-or-password-incorrect.error'));
				req.flash('input', req.body);
				return res.redirect(retry);
			}

			user.auth(password, function(err, status) {
				if (err) return res.serverError(err);

				// not registered
				if (!status) {
					req.flash('danger', Formatter.custom('auth:username-or-password-incorrect.error'));
					req.flash('input', req.body);
					return res.redirect(retry);
				}

				// if registered, auto-login and redirect
				req.session.authenticated = true;
				req.session.user = user;

				if(redirectTo) return res.redirect(redirectTo);
				return res.redirect('user/profile');
			});
		});
	},

	getSignup: function (req, res) {
		res.view('auth/signup', { query: (url.parse(req.originalUrl).query || '') });
	},

	postSignup: function (req, res) {
		var redirectTo = req.param('redirect_to');
		var retry = 'auth/signup' + (redirectTo ? '?redirect_to=' + redirectTo : '');

		User.findOneByUsername(req.body.username).done(function (err, duplicate) {
			if (err) return res.badRequest(err, retry);

			if (duplicate) {
				req.flash('danger', Formatter.custom('auth:username-duplicate.error'));
				req.flash('input', req.body);
				return res.redirect(retry);
			}

			User.create(req.body).done(function (err, user) {
				if (err) return res.badRequest(err, retry);

				// if registered, auto-login and redirect
				req.session.authenticated = true;
				req.session.user = user;

				if(redirectTo) return res.redirect(redirectTo);
				return res.redirect('user/profile');
			});
		});
	},

	postSignout: function (req, res) {
		req.session.destroy(function() {
			return res.redirect('/');
		});
	}

	/*************************************************************************/
	/********************** R E S T F U L   A P I ****************************/
	/*************************************************************************/

	// TODO: authentication API
};
