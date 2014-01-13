
module.exports = function (req, res, next) {

	var findParticipant = function (where, cb) { Participant.findOne(where).done(cb); }
	var findTopic = function (where, cb) { Topic.findOne(where).done(cb); }
	var findMessage = function (where, cb) { Message.findOne(where).done(cb); }

	var check = function (find, where, test, cb) {
		find(where, function (err, participant) {
			if (err) return cb(err);
			if (participant) return test(participant, cb);
			return cb(null, false);
		});
	}

	var isMetaMember = function (participant, cb) { return cb(null, participant.isMetaMember()); };
	var isMember = function(participant, cb) { return cb(null, participant.isMember()); };
	var isStaff = function(participant, cb) { return cb(null, participant.isStaff()); };

	return Bouncer()
		.when('chat/read', function (param, cb) {
			check(findParticipant, { user: param('me').id, chat: param('chat') }, isMetaMember, cb);
		})

		.when('chat/participants', function (param, cb) {
			check(findParticipant, { user: param('me').id, chat: param('chat') }, isMetaMember, cb);
		})

		.when('chat/topics', function (param, cb) {
			check(findParticipant, { user: param('me').id, chat: param('chat') }, isMember, cb);
		})

		.when('chat/messages', function (param, cb) {
			check(findParticipant, { user: param('me').id, chat: param('chat') }, isMember, cb);
		})

		.when('chat/invite', function (param, cb) {
			check(findParticipant, { user: param('me').id, chat: param('chat') }, isStaff, cb);
		})

		.when('participant/read', function (param, cb) {
			check(findParticipant, param('participant'), function (participant, ok) {
				check(findParticipant, { user: param('me').id, chat: participant.chat }, isMember, ok);
			}, cb);
		})

		.when('participant/join', function (param, cb) {
			check(findParticipant, param('participant'), function (participant, ok) { return ok(null, participant.user == param('me').id); }, cb);
		})

		.when('participant/leave', function (param, cb) {
			check(findParticipant, param('participant'), function (participant, ok) { return ok(null, participant.user == param('me').id); }, cb);
		})

		.when('participant/connect', function (param, cb) {
			check(findParticipant, param('participant'), function (participant, ok) { return ok(null, participant.user == param('me').id); }, cb);
		})

		.when('participant/disconnect', function (param, cb) {
			check(findParticipant, param('participant'), function (participant, ok) { return ok(null, participant.user == param('me').id); }, cb);
		})

		.when('participant/promote', function (param, cb) {
			check(findParticipant, param('participant'), function (participant, cb) {
				check(findParticipant, {user: param('me').id }, function (me, ok) { return ok(null, me.isHigherThan(participant)); }, cb);
			});
		})

		.when('participant/revoke', function (param, cb) {
			check(findParticipant, param('participant'), function (participant, cb) {
				check(findParticipant, {user: param('me').id }, function (me, ok) { return ok(null, me.isHigherThan(participant)); }, cb);
			});
		})

		.when('topic/create', function (param, cb) {
			check(findParticipant, param('participant'), function (participant, ok) { return ok(null, participant.isMember() && participant.user == param('me').id); }, cb);
		})

		.when('topic/destroy', function (param, cb) {
			check(findTopic, param('topic'), function (topic, done) {
				check(findParticipant, topic.participant, function (participant, ok) { return ok(null, participant.user == param('me').id); }, done);
			}, cb);
		})

		.when('message/create', function (param, cb) {
			check(findParticipant, param('participant'), function (participant, ok) { return ok(null, participant.isMember() && participant.user == param('me').id); }, cb);
		})

		.when('message/subjects', function (param, cb) {
			check(findMessage, param('message'), function (message, ok) {
				check(findParticipant, message.participant, isMember, ok);
			}, cb);
		})

		.when('message/recipients', function (param, cb) {
			check(findMessage, param('message'), function (message, ok) {
				check(findParticipant, message.participant, isMember, ok);
			}, cb);
		})

	.bounce(req, res, next);
};
