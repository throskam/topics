
module.exports = {
	/*************************************************************************/
	/******************** R E S T F U L   V I E W S **************************/
	/*************************************************************************/

	getIndex: function (req, res) {
		res.view('chat/index');
	},

	getHome: function (req, res) {
		res.view('chat/templates/home', { layout: null });
	},

	getCreate: function (req, res) {
		res.view('chat/templates/create', { layout: null });
	},

	getRead: function (req, res) {
		res.view('chat/templates/read', { layout: null });
	},

	get500: function (req, res) {
		res.view('chat/templates/500', { layout: null });
	},

	getUser: function (req, res) {
		res.view('chat/templates/partials/user', { layout: null, user: req.session.user });
	},

	getMessage: function (req, res) {
		res.view('chat/templates/partials/message', { layout: null, user: req.session.user });
	},

	/*************************************************************************/
	/********************** R E S T F U L   A P I ****************************/
	/*************************************************************************/

	find: function (req, res) {
		Participant.find({ user: req.session.user.id }).done(function (err, participants) {
			if (err) return res.serverError(err);

			var chats = [];

			Chat.notify(req.socket);

			async.each(participants, function (participant, cb) {
				Chat.findOneById(participant.chat).done(function (err, chat) {
					if (err) return res.serverError(err);

					if (chat) {
						chats.push(chat);
						if (participant.isHigherThanOrEqual('member')) Chat.notify(req.socket, chat);
					}

					cb();
				});
			}, function (err) {
				if (err) return res.serverError(err);

				return res.json(chats);
			});
		});
	},

	create: function (req, res) {
		// Set ownership
		req.body.owner = req.session.user.id;

		Chat.create(req.body).done(function (err, chat) {
			if (err) return res.serverError(err);

			Chat.publishCreate(chat);
			return res.json(chat);
		});
	},

	read: function (req, res) {
		Chat.findOneById(req.param('chat')).done(function (err, chat) {
			if (err) return res.severError(err);
			if (!chat) return res.badRequest('home:chat-not-found.error');

			Participant.findOneByUser(req.session.user.id).done(function (err, participant) {
				if (err) return res.serverError(err);
				if (!chat) return res.badRequest('home:participant-not-found.error');

				if (participant.isHigherThanOrEqual('member')) Chat.notify(req.socket, chat);
				return res.json(chat);
			});
		});
	},

	update: function (req, res) {
		return res.serverError('Not Yet Implemented');
	},

	destroy: function (req, res) {
		return res.serverError('Not Yet Implemented');
	},

	participants: function (req, res) {
		Participant.findByChat(req.param('chat')).done(function (err, participants) {
			if (err) return res.severError(err);

			Participant.notify(req.socket, participants);
			return res.json(participants);
		});
	},

	topics: function (req, res) {
		Topic.findByChat(req.param('chat')).done(function (err, topics) {
			if (err) return res.severError(err);

			Topic.notify(req.socket, topics);
			return res.json(topics);
		});
	},

	messages: function (req, res) {
		Message.findByChat(req.param('chat')).done(function (err, messages) {
			if (err) return res.severError(err);

			Message.notify(req.socket, messages);
			return res.json(messages);
		});
	},

	icebreak: function (req, res) {
		Chat.findOneBySlug(req.param('slug')).done(function (err, chat) {
			if (err) return res.serverError(err);
			if (!chat) return res.badRequest('home:chat-not-found.error');

			Participant.findOne({ user: req.session.user.id, chat: chat.id }).done(function (err, participant) {
				if (err) return res.serverError(err);
				if (participant) return res.badRequest(participant.type == 'icebreak' ? 'chat:icebreak-duplicate.error' : 'chat:participant-duplicate.error');

				Participant.create({
					user: req.session.user.id,
					chat: chat.id,
					type: 'icebreak',
					connected: false
				}).done(function (err, newParticipant) {
					if (err) return res.serverError(err);

					Chat.publishIcebreak(newParticipant);
					return res.json(newParticipant);
				});
			});
		});
	},

	invite: function (req, res) {
		Chat.findOneById(req.param('chat')).done(function (err, chat) {
			if (err) return res.serverError(err);
			if (!chat) return res.badRequest('home:chat-not-found.error');

			User.findOneByUsername(req.param('user')).done(function (err, user) {
				if (err) return res.serverError(err);
				if (!user) return res.badRequest('home:user-not-found.error');

				Participant.findOne({ user: user.id, chat: chat.id }).done(function (err, participant) {
					if (err) return res.serverError(err);

					if (participant) {
						if (participant.type != 'icebreak') return res.badRequest('chat:participant-duplicate.error');

						participant.type = 'voice';

						participant.save(function (err) {
							if (err) return res.serverError(err);

							Participant.publishJoin(participant);
							return res.json(participant);
						});
					}

					else {
						Participant.create({
							user: user.id,
							chat: chat.id,
							type: 'invite',
							connected: false
						}).done(function (err, newParticipant) {
							if (err) return res.serverError(err);

							Chat.publishInvite(newParticipant);
							return res.json(newParticipant);
						});
					}
				});
			});
		});
	}
};
