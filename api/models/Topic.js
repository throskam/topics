
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

		slug: {
			type: 'string',
			required: true,
		},

		title: {
			type: 'string',
			required: true
		},

		description: {
			type: 'string'
		}
	},

	notify: function (socket, topics) {
		Socket.notify(Topic, socket, topics);
	},

	publishCreate: function (values) {
		// Sockets attached to the topic's chat.
		var sockets = Chat.subscribers(values.chat);

		Socket.introduce(this.room(values.id), sockets);
		Socket.publish(Formatter.eventify('topic:create', values), this.subscribers(values.id));
	},

	publishUpdate: function (id, changes) {
		// TODO: publish update topic
	},

	publishDestroy: function (id) {
		// TODO: publish destroy topic
	},
};
