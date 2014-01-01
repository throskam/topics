
module.exports = {
	/*************************************************************************/
	/********************** R E S T F U L   A P I ****************************/
	/*************************************************************************/

	find: function (req, res) {
		return res.json([]);
	},

	create: function (req, res) {
		// TODO: participant create
		return res.serverError('Not Yet Implemented');
	},

	read: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err);
			if (!participant) return res.badRequest('home:participant-not-found');

			Participant.notify(req.socket, participant);
			return res.json(participant);
		});
	},

	update: function (req, res) {
		// TODO: participant update
		return res.serverError('Not Yet Implemented');
	},

	destroy: function (req, res) {
		// TODO: participant destroy
		return res.serverError('Not Yet Implemented');
	},

	join: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err, req, res);
			if (!participant) return res.badRequest('home:participant-not-invited');

			if (participant.type == 'invite') {
				participant.type = 'voice';

				participant.save(function (err) {
					if (err) return res.serverError(err, req, res);

					Participant.publishJoin(participant);
					return res.json(participant);
				});
			}

			else if (participant.type == 'icebreak') {
				return res.badRequest('participant-not-invited');
			}

			else {
				return res.badRequest('participant-duplicate');
			}
		});

	},

	leave: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err);
			if (!participant) return res.badRequest('home:participant-not-found.error');

			participant.destroy(function (err) {
				if (err) return res.serverError(err);

				Participant.publishLeave(participant);
				return res.json(participant);
			});

		});
	},

	connect: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err);
			if (!participant) return res.badRequest('home:participant-not-found.error');

			participant.connected = true;

			participant.save(function (err) {
				if (err) return res.serverError(err, req, res);

				Participant.publishConnect(participant);
				return res.json(participant);
			});
		});
	},

	disconnect: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err);
			if (!participant) return res.badRequest('home:participant-not-found.error');

			participant.connected = false;
			participant.last_seen = new Date().toISOString();

			participant.save(function (err) {
				if (err) return res.serverError(err, req, res);

				Participant.publishDisconnect(participant);
				return res.json(participant);
			});
		});
	},

	revoke: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err, req, res);
			if (!participant) return res.badRequest('home:participant-not-found.error');

			participant.destroy(function (err) {
				if (err) return res.serverError(err, req, res);

				Participant.publishLeave(participant);
				return res.json(participant);
			});
		});
	},

	promote: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err, req, res);
			if (!participant) return res.badRequest('home:participant-not-invited');

			participant.type = req.param('type');

			participant.save(function (err) {
				if (err) return res.serverError(err);

				Participant.publishPromote(participant);
				return res.json(participant);
			});
		});
	}
};
