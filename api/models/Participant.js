
module.exports = {

	attributes: {

		user: {
			type: 'integer',
			required: true
		},

		chat: {
			type: 'integer',
			required: true
		},

		type: {
			type: 'string',
			required: true
		},

		connected: {
			type: 'boolean',
			required: true
		},

		last_seen: {
			type: 'datetime'
		},

		types : function () {
			return ['revoke', 'part', 'icebreak', 'invite', 'mute', 'voice', 'moderator', 'admin', 'creator'];
		},

		isRevoked: function () {
			return this.type == 'revoke';
		},

		isIcebreak: function () {
			return this.type == 'icebreak';
		},

		isInvite: function () {
			return this.type == 'invite';
		},

		isMetaMember: function () {
			return this.isHigherThanOrEqual('icebreak');
		},

		isMember: function () {
			return this.isHigherThanOrEqual('mute');
		},

		isStaff: function () {
			return this.isHigherThanOrEqual('moderator');
		},

		isHigherThan: function (type) {
			return _.indexOf(this.types(), type) < _.indexOf(this.types(), this.type);
		},

		isHigherThanOrEqual: function (type) {
			return _.indexOf(this.types(), type) <= _.indexOf(this.types(), this.type);
		}
	},

	notify: function (socket, participants) {
		Socket.notify(Participant, socket, participants);
	},

	publishCreate: function (values) {
		// TODO: publish create participant
	},

	publishJoin: function (values) {
		// The participant should be introduced to the concerned chat.
		Socket.introduce(Chat.room(values.chat), Socket.userToSockets(values.user, Chat.subscribers()));

		// The participant is introduced to the chat
		Socket.introduce(this.room(values.id), Chat.subscribers(values.chat));
		Socket.publish(Formatter.eventify('participant:join', values), this.subscribers(values.id));
	},

	publishUpdate: function (id, changes) {
		// TODO: publish update participant
	},

	publishConnect: function (values) { Socket.publish(Formatter.eventify('participant:connect', values), this.subscribers(values.id)); },
	publishDisconnect: function (values) { Socket.publish(Formatter.eventify('participant:disconnect', values), this.subscribers(values.id)); },
	publishPromote: function (values) { Socket.publish(Formatter.eventify('participant:promote', values), this.subscribers(values.id)); },

	publishRevoke: function (values) {
		Socket.publish(Formatter.eventify('participant:revoke', values), this.subscribers(values.id));
		Socket.obituary(this.room(values.id), this.subscribers(values.id));

		// The participant should be unsubscribed to the concerned chat and any other content of it
		Socket.obituary(Chat.room(values.chat), Socket.userToSockets(values.user, Chat.subscribers(values.chat)));
		// TODO: obituary for all message, participant and topic of the chat
	},

	publishLeave: function (values) {
		Socket.publish(Formatter.eventify('participant:leave', values), this.subscribers(values.id));
		Socket.obituary(this.room(values.id), this.subscribers(values.id));

		// The participant should be unsubscribed to the concerned chat and any other content of it
		Socket.obituary(Chat.room(values.chat), Socket.userToSockets(values.user, Chat.subscribers(values.chat)));
		// TODO: obituary for all message, participant and topic of the chat
	},

	publishDestroy: function (values) {
		// TODO: publish destroy participant
	},

	beforeDestroy: function (criteria, cb) {
		// TODO: remove associated recipient
		cb();
	}
};










