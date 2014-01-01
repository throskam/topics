
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
			return ['icebreak', 'invite', 'member', 'voice', 'moderator', 'admin', 'creator'];
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

	publishUpdate: function (id, changes) {
		// TODO: publish update participant
	},

	publishDestroy: function (id) {
		// TODO: publish destroy participant
	},

	publishJoin: function (participant) {
		// The participant should be subscribed to the concerned chat.
		Socket.introduce(Chat.room(participant.chat), Socket.userToSockets(participant.user, Chat.subscribers()));
		Socket.publish(Formatter.eventify('participant:join', participant), this.subscribers(participant.id));
	},

	publishLeave: function (participant) {
		Socket.publish(Formatter.eventify('participant:leave', participant), this.subscribers(participant.id));
		// The participant should be unsubscribed to the concerned chat.
		Socket.obituary(Chat.room(participant.chat), Socket.userToSockets(participant.user, Chat.subscribers(participant.chat)));
	},

	publishConnect: function (participant) { Socket.publish(Formatter.eventify('participant:connect', participant), this.subscribers(participant.id)); },
	publishDisconnect: function (participant) { Socket.publish(Formatter.eventify('participant:disconnect', participant), this.subscribers(participant.id)); },
	publishPromote: function (participant) { Socket.publish(Formatter.eventify('participant:promote', participant), this.subscribers(participant.id)); },
};










