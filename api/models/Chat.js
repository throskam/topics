var crypto = require('crypto');

module.exports = {

	schema: true,

	attributes: {
		user: {
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
		// Only the user is introduced to the new chat.
		Socket.introduce(this.room(values.id), Socket.userToSockets(values.user, this.subscribers()));
		Socket.publish(Formatter.eventify('chat:create', values), this.subscribers(values.id));
	},

	publishUpdate: function (id, changes) {
		Socket.publish(Formatter.eventify('chat:update', {
			id: id,
			changes: changes
		}), this.subscribers(id));
	},

	publishIcebreak: function (values) {
		Socket.introduce(Participant.room(values.id), this.subscribers(values.chat));

		// Manually add the invited user since he's not in the chat room yet.
		Socket.introduce(Participant.room(values.id), Socket.userToSockets(values.user, this.subscribers()));
		Socket.publish(Formatter.eventify('chat:icebreak', values), Participant.subscribers(values.id));
	},

	publishInvite: function (values) {
		Socket.introduce(Participant.room(values.id), this.subscribers(values.chat));

		// Manually add the invited user since he's not in the chat room yet.
		Socket.introduce(Participant.room(values.id), Socket.userToSockets(values.user, this.subscribers()));
		Socket.publish(Formatter.eventify('chat:invite', values), Participant.subscribers(values.id));
	},

	publishDestroy: function (values) {
		Socket.publish(Formatter.eventify('chat:destroy', values), this.subscribers(values.id));
		Socket.obituary(this.room(values.id), this.subscribers(values.id));
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
		// Immediatly create the user participant correspondant.
		Participant.create({
			user: values.user,
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
		cb();
	}
};
