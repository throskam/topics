
module.exports = {

	schema: true,

	attributes: {
		chat: {
			type: 'integer',
			required: true
		},

		owner: {
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
		// Sockets attached to the message's chat.
		var sockets = Chat.subscribers(values.chat);

		Socket.introduce(this.room(values.id), sockets);
		Socket.publish(Formatter.eventify('message:create', values), this.subscribers(values.id));
	},

	publishUpdate: function (id, changes) {
		Socket.publish(Formatter.eventify('message:update', {
			id: id,
			changes: changes
		}), this.subscribers(id));
	},

	publishDestroy: function (id) {
		Socket.publish(Formatter.eventify('message:destroy', { id: id }), this.subscribers(id));
		Socket.obituary(this.room(id), this.subscribers(id));
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

		// create recipients
		for (var i in users) {
			User.findOneByUsername(users[i]).done(function (err, user) {
				if (err) return cb(err);

				if (!user) return;

				Recipient.create({
					message: values.id,
					user: user.id
				}).done(function (err, recipient) {
					if (err) return cb(err);
				});
			});
		}

		// create subjects
		for (var i in topics) {
			Topic.findOne({
				slug: topics[i],
				chat: values.chat
			}).done(function (err, topic) {
				if (err) return cb(err);

				if (!topic) return;

				Subject.create({
					message: values.id,
					topic: topic.id
				}).done(function (err, subject) {
					if (err) return cb(err);
				});
			});
		}

		cb();
	},

	beforeDestroy: function (criteria, cb) {
		// TODO: before destroy
		cb();
	}
};
