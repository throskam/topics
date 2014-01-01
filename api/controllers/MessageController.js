
module.exports = {
	/*************************************************************************/
	/********************** R E S T F U L   A P I ****************************/
	/*************************************************************************/

	find: function (req, res) {
		return res.json([]);
	},

	create: function (req, res) {
		// Set ownership
		req.body.owner = req.session.user.id;

		Message.create(req.body).done(function (err, message) {
			if (err) return res.serverError(err);

			Message.publishCreate(message);
			return res.json(message);
		});
	},

	read: function (req, res) {
		// TODO: message read
		return res.serverError('Not Yet Implemented');
	},

	update: function (req, res) {
		// TODO: message update
		return res.serverError('Not Yet Implemented');
	},

	destroy: function (req, res) {
		// TODO: message destroy
		return res.serverError('Not Yet Implemented');
	},

	subjects: function (req, res) {
		Subject.findByMessage(req.param('message')).done(function (err, subjects) {
			if (err) return res.serverError(err);

			Subject.notify(req.socket, subjects);
			return res.json(subjects);
		});
	},

	recipients: function (req, res) {
		Recipient.findByMessage(req.param('message')).done(function (err, recipients) {
			if (err) return res.serverError(err);

			Recipient.notify(req.socket, recipients);
			return res.json(recipients);
		});
	}
};