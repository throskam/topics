
module.exports = {
	/*************************************************************************/
	/********************** R E S T F U L   A P I ****************************/
	/*************************************************************************/

	find: function (req, res) {
		// TODO: message find
	},

	create: function (req, res) {
		Message.create(req.body).done(function (err, message) {
			if (err) return res.serverError(err);

			Message.publishCreate(message);
			return res.json(message);
		});
	},

	read: function (req, res) {
		// TODO: message read
	},

	update: function (req, res) {
		// TODO: message update
	},

	destroy: function (req, res) {
		// TODO: message destroy
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