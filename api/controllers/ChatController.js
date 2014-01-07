
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

	getParticipant: function (req, res) {
		res.view('chat/templates/partials/participant', { layout: null });
	},

	getTopic: function (req, res) {
		res.view('chat/templates/partials/topic', { layout: null });
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

					if (chat && participant.isMetaMember()) {
						chats.push(chat);
						if (participant.isMember()) Chat.notify(req.socket, chat);
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

				if (participant.isHigherThanOrEqual('mute')) Chat.notify(req.socket, chat);
				return res.json(chat);
			});
		});
	},

	update: function (req, res) {
		// TODO: chat update
		return res.serverError('Not Yet Implemented');
	},

	destroy: function (req, res) {
		// TODO: chat destroy
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

				if (participant) {
					if (participant.isMetaMember()) return res.badRequest(participant.isIcebreak() ? 'chat:icebreak-duplicate.error' : 'chat:participant-duplicate.error');
					if (participant.isRevoked()) return res.badRequest('chat:icebreak-revoke.error');

					if (chat.restricted) {
						participant.type = 'icebreak';
						participant.save(function (err) {
							if (err) return res.serverError(err);

							Chat.publishIcebreak(participant);
							return res.json(participant);
						});
					}

					else {
						participant.type = 'voice';
						participant.save(function (err) {
							if (err) return res.serverError(err);

							Chat.publishIcebreak(participant);
							Participant.publishJoin(participant);
							return res.json(participant);
						});
					}
				}

				else {
					if (chat.restricted) {
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
					}

					else {
						Participant.create({
							user: req.session.user.id,
							chat: chat.id,
							type: 'voice',
							connected: false
						}).done(function (err, newParticipant) {
							if (err) return res.serverError(err);

							Chat.publishIcebreak(newParticipant);
							Participant.publishJoin(newParticipant);
							return res.json(newParticipant);
						});
					}
				}
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
						if (participant.isMetaMember()) {
							if (participant.isIcebreak()) {
								participant.type = 'voice';
								participant.save(function (err) {
									if (err) return res.serverError(err);

									Participant.publishJoin(participant);
									return res.json(participant);
								});
							}

							else {
								return res.badRequest('chat:participant-duplicate.error');
							}
						}

						else {
							participant.type = 'invite';
							participant.save(function (err) {
								if (err) return res.serverError(err);

								Chat.publishInvite(participant);
								return res.json(participant);
							});
						}
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
