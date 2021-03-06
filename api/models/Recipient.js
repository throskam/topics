
module.exports = {

	attributes: {

		message: {
			type: 'integer',
			required: true
		},

		participant: {
			type: 'integer',
			required: true
		}
	},

	notify: function (socket, recipients) {
		Socket.notify(Recipient, socket, recipients);
	},

	publishCreate: function (values) {
		// TODO: publish create recipient
	},

	publishUpdate: function (id, changes) {
		// TODO: publish update recipient
	},

	publishDestroy: function (values) {
		// TODO: publish destroy recipient
	}
};
