
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

	publishDestroy: function (values) {
		Socket.publish(Formatter.eventify('topic:destroy', values), this.subscribers(values.id));
		Socket.obituary(this.room(values.id), this.subscribers(values.id));
	},

	beforeDestroy: function (criteria, cb) {
		Topic.find(criteria).done(function (err, topics) {
			async.each(topics, function (topic, next) {
				Subject.findByTopic(topic.id).done(function (err, subjects) {
					async.each(subjects, function (subject, done) {
						subject.destroy(done);
						Subject.publishDestroy(subject);
					}, next);
				});
			}, cb);
		});
	}
};
