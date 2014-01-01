
module.exports = function (req, res, next) {

	// keep a pointer to the orginal view method
	var base = res.view;

	// overload the res.view method
	res.view = function (specifiedPath, data, fun) {

		// expose useful variables and methods
		res.locals({
			successes: req.flash('success'),
			notices: req.flash('notice'),
			warnings: req.flash('warning'),
			dangers: req.flash('danger'),
			input: req.flash('input')[0] || {},
			error: req.flash('error')[0] || {},
			flashes: req.flash(),
			authenticated: req.session.authenticated,
			user: req.user,
			___: function(err) { return Formatter.stringify(err, res.i18n); },
			register: function(id, script) {
				res.locals.scripts = res.locals.scripts || {};
				res.locals.scripts[id] = script;
			}
		});

		// called the sails.js view method
		base(specifiedPath, data, fun);
	};

	// continue the process
	next();

}