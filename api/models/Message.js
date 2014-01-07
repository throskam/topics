
module.exports = {

	schema: true,

	attributes: {
		chat: {
			type: 'integer',
			required: true
		},

		participant: {
			type: 'integer',
			required: true
		},

		content: {
			type: 'string',
			required: true
		}
	},

	notify: function (socket, messages) {
		Socket.notify(Message, socket, messages);
	},

	publishCreate: function (values) {
		Socket.introduce(this.room(values.id), Chat.subscribers(values.chat));
		Socket.publish(Formatter.eventify('message:create', values), this.subscribers(values.id));
	},

	publishUpdate: function (id, changes) {
		Socket.publish(Formatter.eventify('message:update', {
			id: id,
			changes: changes
		}), this.subscribers(id));
	},

	publishDestroy: function (values) {
		Socket.publish(Formatter.eventify('message:destroy', values), this.subscribers(values.id));
		Socket.obituary(this.room(values.id), this.subscribers(values.id));
	},

	afterCreate: function (values, cb) {
		// parse the message body to extract recipients and topics
		var body = values.content;
		var text = '';
		var user = false;
		var topic = false;
		var users = [];
		var topics = [];

		for (var i = 0; i < body.length; i++) {
			var cur = body[i];

			if (cur == ' ') {
				if (user) users.push(user);
				else if (topic) topics.push(topic);
				user = false;
				topic = false;
			}

			if (user !== false) { user += cur; continue; }
			if (topic !== false) { topic += cur; continue; }
			if (cur == '@') { user = ''; continue; }
			if (cur == '#') { topic = ''; continue; }

			text += cur;
		};

		if (user) users.push(user);
		else if (topic) topics.push(topic);

		users = _.uniq(users);
		topics = _.uniq(topics);

		async.parallel([
			function (done) {
				async.each(users, function (item, next) {
					User.findOneByUsername(item).done(function (err, user) {
						if (err) return next(err);
						if (!user) return next();

						Participant.findOne({ user: user.id, chat: values.chat }).done(function (err, participant) {
							if (err) return next(err);
							if (!participant) return next();

							Recipient.create({
								message: values.id,
								participant: participant.id
							}).done(function (err, recipient) {
								if (err) return next(err);
								next();
							});
						});
					});
				}, function (err) {
					if (err) return done(err);
					done();
				});
			},
			function (done) {
				async.each(topics, function (item, next) {
					Topic.findOne({
						slug: item,
						chat: values.chat
					}).done(function (err, topic) {
						if (err) return next(err);
						if (!topic) return next();

						Subject.create({
							message: values.id,
							topic: topic.id
						}).done(function (err, subject) {
							if (err) return next(err);
							next();
						});

					});
				}, function (err) {
					if (err) return done(err);
					done();
				});
			}
		], function (err, results) {
			// TODO: remove the currently create message ?
			if (err) return cb(err);
			cb();
		});

	},

	beforeDestroy: function (criteria, cb) {
		// TODO: before destroy
		cb();
	}
};
