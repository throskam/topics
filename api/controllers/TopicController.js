
module.exports = {
	/*************************************************************************/
	/********************** R E S T F U L   A P I ****************************/
	/*************************************************************************/

	find: function (req, res) {
		return res.json([]);
	},

	create: function (req, res) {
		Topic.create(req.body).done(function (err, topic) {
			if (err) return res.serverError(err);

			Topic.publishCreate(topic);
			return res.json(topic);
		});
	},

	read: function (req, res) {
		// TODO: topic read
		return res.serverError('Not Yet Implemented');
	},

	update: function (req, res) {
		// TODO: topic update
		return res.serverError('Not Yet Implemented');
	},

	destroy: function (req, res) {
		// TODO: topic destroy
		return res.serverError('Not Yet Implemented');
	},
};
