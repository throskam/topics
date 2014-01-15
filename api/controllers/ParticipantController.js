
module.exports = {
	/*************************************************************************/
	/********************** R E S T F U L   A P I ****************************/
	/*************************************************************************/

	find: function (req, res) {
		// TODO: participant find
	},

	create: function (req, res) {
		// TODO: participant create
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
	},

	destroy: function (req, res) {
		// TODO: participant destroy
	},

	join: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err);
			if (!participant) return res.badRequest('home:participant-not-invited');

			if (participant.isMember()) {
				return res.badRequest('participant-duplicate');
			}

			else if (participant.isInvite()) {
				participant.type = 'voice';

				participant.save(function (err) {
					if (err) return res.serverError(err);

					Participant.publishJoin(participant);
					return res.json(participant);
				});
			}

			else {
				return res.badRequest('participant-not-invited');
			}
		});

	},

	leave: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err);
			if (!participant) return res.badRequest('home:participant-not-found.error');

			participant.type = 'part';
			participant.connected = false;
			participant.last_seen = new Date().toISOString();

			participant.save(function (err) {
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
				if (err) return res.serverError(err);

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
				if (err) return res.serverError(err);

				Participant.publishDisconnect(participant);
				return res.json(participant);
			});
		});
	},

	promote: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err);
			if (!participant) return res.badRequest('home:participant-not-found.error');

			participant.type = req.param('type');

			participant.save(function (err) {
				if (err) return res.serverError(err);

				Participant.publishPromote(participant);
				return res.json(participant);
			});
		});
	},

	revoke: function (req, res) {
		Participant.findOneById(req.param('participant')).done(function (err, participant) {
			if (err) return res.serverError(err);
			if (!participant) return res.badRequest('home:participant-not-found.error');

			participant.type = 'revoke';
			participant.connected = false;
			participant.last_seen = new Date().toISOString();

			participant.save(function (err) {
				if (err) return res.serverError(err);

				Participant.publishRevoke(participant);
				return res.json(participant);
			});
		});
	}
};
