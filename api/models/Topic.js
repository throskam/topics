
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
		Socket.introduce(this.room(values.id), Chat.subscribers(values.chat));
		Socket.publish(Formatter.eventify('topic:create', values), this.subscribers(values.id));
	},

	publishUpdate: function (id, changes) {
		// TODO: publish update topic
	},

	publishDestroy: function (id) {
		Socket.publish(Formatter.eventify('topic:destroy', { id: id }), this.subscribers(id));
		Socket.obituary(this.room(id), this.subscribers(id));
	},

	beforeDestroy: function (criteria, cb) {
		Topic.find(criteria).done(function (err, topics) {
			async.each(topics, function (topic, next) {
				Subject.findByTopic(topic.id).done(function (err, subjects) {
					async.each(subjects, function (subject, next2) {
						subject.destroy(next2);
					}, next);
				});
			}, cb);
		});
	}
};
