
module.exports = {

	attributes: {

		message: {
			type: 'integer',
			required: true
		},

		topic: {
			type: 'integer',
			required: true
		}
	},

	notify: function (socket, subjects) {
		Socket.notify(Subject, socket, subjects);
	},

	publishCreate: function (values) {
		// TODO: publish create subject
	},

	publishUpdate: function (id, changes) {
		// TODO: publish update subject
	},

	publishDestroy: function (values) {
		Socket.publish(Formatter.eventify('subject:destroy', values), this.subscribers(values.id));
		Socket.obituary(this.room(values.id), this.subscribers(values.id));
	},

};
