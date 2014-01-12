/**
 * REFACTOR:
 *
 * 	- transform check
 * 		- accept async
 * 		- diff find method
 * 	- find
 * 		- add find for other stuff
 * 	- is*
 * 		- just the test
 */

module.exports = function (req, res, next) {

	var find = function (where, cb) { Participant.findOne(where).done(cb); }

	var check = function (where, test, cb) {
		find(where, function (err, participant) {
			if (err) return cb(err);
			if (participant && test(participant)) return cb(null, true);
			return cb(null, false);
		});
	}

	var isMetaMember = function (where, cb) { check(where, function (participant) { return participant.isMetaMember(); }, cb); }
	var isMember = function (where, cb) { check(where, function (participant) { return participant.isMember(); }, cb); }
	var isStaff = function (where, cb) { check(where, function (participant) { return participant.isStaff(); }, cb); }

	return Bouncer()
		.when('chat/read', function (param, cb) {
			isMetaMember({ user: param('me').id, chat: param('chat') }, cb);
		})

		.when('chat/participants', function (param, cb) {
			isMember({ user: param('me').id, chat: param('chat') }, cb);
		})

		.when('chat/topics', function (param, cb) {
			isMember({ user: param('me').id, chat: param('chat') }, cb);
		})

		.when('chat/messages', function (param, cb) {
			isMember({ user: param('me').id, chat: param('chat') }, cb);
		})

		.when('chat/invite', function (param, cb) {
			isStaff({ user: param('me').id, chat: param('chat') }, cb);
		})

		.when('participant/read', function (param, cb) {
			find(param('participant'), function (err, participant) {
				if (err) return cb(err);
				isMember({ user: param('me').id, chat: participant.chat }, cb);
			});
		})

		.when('participant/join', function (param, cb) {
			check(param('participant'), function (participant) { return participant.user == param('me').id; }, cb);
		})

		.when('participant/leave', function (param, cb) {
			check(param('participant'), function (participant) { return participant.user == param('me').id; }, cb);
		})

		.when('participant/connect', function (param, cb) {
			check(param('participant'), function (participant) { return participant.user == param('me').id; }, cb);
		})

		.when('participant/disconnect', function (param, cb) {
			check(param('participant'), function (participant) { return participant.user == param('me').id; }, cb);
		})

		.when('participant/promote', function (param, cb) {
			find(param('participant'), function (err, participant) {
				if (err) return cb(err);
				check({user: param('me').id }, function (me) { return me.isHigherThan(participant); }, cb);
			});
		})

		.when('participant/revoke', function (param, cb) {
			find(param('participant'), function (err, participant) {
				if (err) return cb(err);
				check({user: param('me').id }, function (me) { return me.isHigherThan(participant); }, cb);
			});
		})

		.when('topic/create', function (param, cb) {
			check(param('participant'), function (participant) { return participant.isMember() && participant.user == param('me').id; }, cb)
		})

		.when('topic/destroy', function (param, cb) {
			Topic.findOne(param('topic')).done(function (err, topic) {
				if (err) return cb(err);
				check(topic.participant, function (participant) { return participant.user == param('me').id; }, cb);
			});
		})

		.when('message/create', function (param, cb) {
			check(param('participant'), function (participant) { return participant.isMember() && participant.user == param('me').id; }, cb)
		})

		.when('message/subjects', function (param, cb) {
			Message.findOne(param('message')).done(function (err, message) {
				if (err) return cb(err);

				isMember(message.participant, cb);
			});
		})

		.when('message/recipients', function (param, cb) {
			Message.findOne(param('message')).done(function (err, message) {
				if (err) return cb(err);

				isMember(message.participant, cb);
			});
		})

	.bounce(req, res, next);
};
