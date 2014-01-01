var crypto = require('crypto');

module.exports = {

	schema: true,

	attributes: {
		owner: {
			type: 'integer',
			required: true,
		},

		slug: {
			type: 'string',
			required: true
		},

		title: {
			type: 'string',
			required: true
		},

		description: {
			type: 'string',
			maxLength: 255
		},

		welcome: {
			type: 'string',
			maxLength: 255
		},

		restricted: {
			type: 'boolean',
		}
	},

	notify: function (socket, chats) {
		Socket.notify(Chat, socket, chats);
	},

	publishCreate: function (values) {
		// Only the owner is introduced to the new chat.
		Socket.introduce(this.room(values.id), Socket.userToSockets(values.owner, this.subscribers()));
		Socket.publish(Formatter.eventify('chat:create', values), this.subscribers(values.id));
	},

	publishUpdate: function (id, changes) {
		Socket.publish(Formatter.eventify('chat:update', {
			id: id,
			changes: changes
		}), this.subscribers(id));
	},

	publishDestroy: function (id) {
		Socket.publish(Formatter.eventify('chat:destroy', { id: id }), this.subscribers(id));
		Socket.obituary(this.room(id), this.subscribers(id));
	},

	publishIcebreak: function (participant) {
		// Sockets subscribe to the concerned chat.
		var sockets = this.subscribers(participant.chat);

		// Since the participant is not part of the chat yet, he has to be manually added to the targeted sockets.
		var targets = Socket.userToSockets(participant.user, this.subscribers());
		_(targets).each(function (target) { sockets.push(target); });

		Socket.publish(Formatter.eventify('chat:icebreak', participant), sockets);
	},

	publishInvite: function (participant) {
		// Sockets subscribe to the concerned chat.
		var sockets = this.subscribers(participant.chat);

		// Since the participant is not part of the chat yet, he has to be manually added to the targeted sockets.
		var targets = Socket.userToSockets(participant.user, this.subscribers());
		_(targets).each(function (target) { sockets.push(target); });

		Socket.publish(Formatter.eventify('chat:invite', participant), sockets);
	},

	beforeValidation: function (values, cb) {
		// hash the slug until it is unique throughout the db
		var hashing = function (slug) {
			var hash = crypto.createHash('sha1').update(slug).digest('hex');

			Chat.findOneBySlug(hash).done(function (err, row) {
				if (err) return cb(err);

				if (row) return hashing(hash);

				values.slug = hash;
				cb();
			});
		};

		// start the processus with the chat title
		hashing(values.title || 'default');
	},

	afterCreate: function (values, cb) {
		// Immediatly create the owner participant correspondant.
		Participant.create({
			user: values.owner,
			chat: values.id,
			type: 'creator',
			connected: false
		}).done(function (err, participant) {
			if (err) return res.badRequest(err, null, req, res);
			cb();
		});
	},

	beforeDestroy: function (criteria, cb) {
		// TODO: before destroy
	}
};
