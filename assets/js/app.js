var app = angular.module('App', ['ngRoute']);

/*********************************/
/********** R O U T E S **********/
/*********************************/

var prepare = function ($q, Redirect, Chats, Request) {
	var defer = $q.defer();

	Chats.once(function (cb) {
		Request.chat.find(function (err, list) {
			if (err) return cb(err);
			if (list.length < 1) return cb();

			async.eachSeries(list, function (data, done) {
				Chats.add(data, function (err, chat) {
					if (err) return done(err);
					done();
				});
			}, function (err) {
				if (err) return cb(err);
				cb();
			});
		});
	}, function(err) {
		if (err) return Redirect.crash();
		defer.resolve();
	});

	return defer.promise;
}

app.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: '/chat/templates/home',
			controller: 'AppController as app',
			resolve: {
				chats: prepare
			}
		})
		.when('/create', {
			templateUrl: '/chat/templates/create',
			controller: 'AppController as app'
		})
		.when('/chat/:slug', {
			templateUrl: '/chat/templates/read',
			controller: 'AppController as app',
			resolve: {
				chats: prepare
			}
		})
		.when('/settings/:slug', {
			templateUrl: '/chat/templates/settings',
			controller: 'AppController as app'
		})
		.when('/500', {
			templateUrl: '/chat/templates/500',
			controller: 'AppController as app'
		});
});

/*********************************/
/******* F A C T O R I E S *******/
/*********************************/

app.factory('Log', function () {
	var log = function (level, data) { console.log(level + ' - ' + JSON.stringify(data)); }

	return {
		trace: function (data) { log('TRACE', data); },
		info: function (data) { log('INFO', data); },
		notice: function (data) { log('NOTICE', data); },
		warning: function (data) { log('WARNING', data); },
		alert: function (data) { log('ALERT', data); },
		error: function (data) { log('ERROR', data); }
	};
});

app.factory('Notification', function (Log) {
	//TODO: notification system (using some sort of js library)
	return Log;
});

app.factory('Storage', function () {
	return function () {
		var map = {};

		return {
			push: function (id, data) { map[id] = data; },
			poll: function (id) { return map[id]; },
			put: function (id, data) { _.assign(map[id], data); },
			pop: function (id) { if (map[id]) delete map[id]; },
			pack: function () { return map; }
		};
	};
});

app.factory('PubSub', function (Log) {
	var callbacks = {};

	return {
		subscribe: function (event, cb) { if (!callbacks[event]) callbacks[event] = []; callbacks[event].push(cb); },
		publish: function (event, data) { Log.trace({ event: event, data: data }); _.each(callbacks[event], function (callback) { callback(data); }); }
	}
});

app.factory('Provider', function (Storage, PubSub) {
	return function (name, construct, fetch) {
		var storage = new Storage();

		var publish = function (event, data) { PubSub.publish(name + ':' + event, data); }

		var add = function (data, cb) {
			construct(data, function (err, object) {
				if (err) return cb(err);
				storage.push(object.id, object);
				publish('created', object);
				cb(null, object);
			});
		};

		var modify = function (data, cb) {
			construct(data, function (err, object) {
				if (err) return cb(err);
				storage.put(object.id, object);
				publish('updated', object);
				cb(null, object);
			});
		};

		var remove = function (id, cb) {
			var o = storage.poll(id);
			storage.pop(id);
			publish('destroyed', o);
			cb(null, o);
		};

		var by = function (id, cb) {
			var object = storage.poll(id);
			if (object) return cb(null, object);

			fetch(id, function (err, data) {
				if (err) return cb(err);
				add(data, cb);
			});
		};

		return {
			add: add,
			modify: modify,
			remove: remove,
			by: by,
			any: function (cb) { cb(null, storage.pack()); },
			exists: function (id) { return storage.poll(id) ? true : false; },
			once: function (func, cb) { var self = this; func(function (err) { if (err) return cb(err); self.once = function (func, cb) { cb(); }; cb(); }); }
		}
	};
});

app.factory('Redirect', function ($route, $location) {
	return {
		to: function (to) { $location.path(to); },
		here: function () { $route.reload(); },
		crash: function () { this.to('/500'); }
	}
});

app.factory('Socket', function ($rootScope, Log) {
	function request (url, data, cb, method) {
		var json = io.JSON.stringify({ url: url, data: data });

		this.emit(method, json, function (response) {
			try { response = io.JSON.parse(response); }
			catch (e) { return cb({ status: 500, errors: 'Server response could not be parsed [' + response + '].' }); }
			Log.trace({ type: method, url: url, data: data, response: response });
			if (response.status) return cb(response);
			return cb(null, response);
		});
	}

	var Socket = io.SocketNamespace;
	Socket.prototype.request = request;
	Socket.prototype.get = function (url, data, cb) { return this.request(url, data, cb, 'get'); };
	Socket.prototype.post = function (url, data, cb) { return this.request(url, data, cb, 'post'); };
	Socket.prototype.put = function (url, data, cb) { return this.request(url, data, cb, 'put'); };
	Socket.prototype.delete = function (url, data, cb) { return this.request(url, data, cb, 'delete'); };

	var socket = io.connect(null, { 'force new connection' : true });

	return {
		on: function (eventName, cb) {
			socket.on(eventName, function () {
				Log.trace(eventName);
				var args = arguments;
				$rootScope.$apply(function () {
					cb.apply(socket, args);
				});
			});
		},

		get: function (url, data, cb) {
			socket.get(url, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (cb) {
						cb.apply(socket, args);
					}
				});
			})
		},

		post: function (url, data, cb) {
			socket.post(url, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (cb) {
						cb.apply(socket, args);
					}
				});
			})
		},

		put: function (url, data, cb) {
			socket.put(url, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (cb) {
						cb.apply(socket, args);
					}
				});
			})
		},

		delete: function (url, data, cb) {
			socket.delete(url, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (cb) {
						cb.apply(socket, args);
					}
				});
			});
		}
	};
});

app.factory('Request', function (Socket) {
	return {
		user: {
			find: function (cb) { Socket.get('/api/user', {}, cb); },
			create: function (user, cb) { Socket.post('/api/user', user, cb); },
			read: function (id, cb) { Socket.get('/api/user/' + id, {}, cb); },
			update: function (id, changes, cb) { Socket.put('/api/user/' + id, changes, cb); },
			destroy: function (id, cb) { Socket.delete('/api/user/' + id, {}, cb); },

			me: function (cb) { Socket.get('/api/user/me', {}, cb); }
		},

		chat: {
			find: function (cb) { Socket.get('/api/chat', {}, cb); },
			create: function (chat, cb) { Socket.post('/api/chat', chat, cb); },
			read: function (id, cb) { Socket.get('/api/chat/' + id, {}, cb); },
			update: function (id, changes, cb) { Socket.put('/api/chat/' + id, changes, cb); },
			destroy: function (id, cb) { Socket.delete('/api/chat/' + id, {}, cb); },

			participants: function (id, cb) { Socket.get('/api/chat/' + id + '/participants', {}, cb); },
			topics: function (id, cb) { Socket.get('/api/chat/' + id + '/topics', {}, cb); },
			messages: function (id, cb) { Socket.get('/api/chat/'+ id + '/messages', {}, cb); },

			icebreak: function (slug, cb) { Socket.put('/api/chat/icebreak/' + slug, {}, cb); },
			invite: function (id, user, cb) { Socket.put('/api/chat/' + id + '/invite/' + user, {}, cb); },
		},

		participant: {
			find: function (cb) { Socket.get('/api/participant', {}, cb); },
			create: function (participant, cb) { Socket.post('/api/participant', participant, cb); },
			read: function (id, cb) { Socket.get('/api/participant/' + id, {}, cb); },
			update: function (id, changes, cb) { Socket.put('/api/participant/' + id, changes, cb); },
			destroy: function (id, cb) { Socket.delete('/api/participant/' + id, {}, cb); },

			join: function (id, cb) { Socket.put('/api/participant/' + id + '/join', {}, cb); },
			leave: function (id, cb) { Socket.put('/api/participant/' + id + '/leave', {}, cb); },
			connect: function (id, cb) { Socket.put('/api/participant/' + id + '/connect', {}, cb); },
			disconnect: function (id, cb) { Socket.put('/api/participant/' + id + '/disconnect', {}, cb); },
			revoke: function (id, cb) { Socket.put('/api/participant/' + id + '/revoke', {}, cb); },
			promote: function (id, type, cb) { Socket.put('/api/participant/' + id + '/promote', { type: type }, cb); }
		},

		topic: {
			find: function (cb) { Socket.get('/api/topic', {}, cb); },
			create: function (topic, cb) { Socket.post('/api/topic', topic, cb); },
			read: function (id, cb) { Socket.get('/api/topic/' + id, {}, cb); },
			update: function (id, changes, cb) { Socket.put('/api/topic/' + id, changes, cb); },
			destroy: function (id, cb) { Socket.delete('/api/topic/' + id, {}, cb); }
		},

		message: {
			find: function (cb) { Socket.get('/api/message', {}, cb); },
			create: function (message, cb) { Socket.post('/api/message', message, cb); },
			read: function (id, cb) { Socket.get('/api/message/' + id, {}, cb); },
			update: function (id, changes, cb) { Socket.put('/api/message/' + id, changes, cb); },
			destroy: function (id, cb) { Socket.delete('/api/message/' + id, {}, cb); },

			subjects: function (id, cb) { Socket.get('/api/message/' + id + '/subjects', {}, cb); },
			recipients: function (id, cb) { Socket.get('/api/message/' + id + '/recipients', {}, cb); }
		},

		recipient: {
			find: function (cb) { Socket.get('/api/recipient', {}, cb); },
			create: function (recipient, cb) { Socket.post('/api/recipient', recipient, cb); },
			read: function (id, cb) { Socket.get('/api/recipient/' + id, {}, cb); },
			update: function (id, changes, cb) { Socket.put('/api/recipient/' + id, changes, cb); },
			destroy: function (id, cb) { Socket.delete('/api/recipient/' + id, {}, cb); }
		},

		subject: {
			find: function (cb) { Socket.get('/api/subject', {}, cb); },
			create: function (subject, cb) { Socket.post('/api/subject', subject, cb); },
			read: function (id, cb) { Socket.get('/api/subject/' + id, {}, cb); },
			update: function (id, changes, cb) { Socket.put('/api/subject/' + id, changes, cb); },
			destroy: function (id, cb) { Socket.delete('/api/subject/' + id, {}, cb); }
		}
	};
});

app.factory('Event', function (Socket) {
	return {
		user: {
			create: function (cb) { Socket.on('user:create', cb); },
			update: function (cb) { Socket.on('user:update', cb); },
			destroy: function (cb) { Socket.on('user:destroy', cb); }
		},

		chat: {
			create: function (cb) { Socket.on('chat:create', cb); },
			update: function (cb) { Socket.on('chat:update', cb); },
			destroy: function (cb) { Socket.on('chat:destroy', cb); },

			icebreak: function (cb) { Socket.on('chat:icebreak', cb); },
			invite: function (cb) { Socket.on('chat:invite', cb); }
		},

		participant: {
			create: function (cb) { Socket.on('participant:create', cb); },
			update: function (cb) { Socket.on('participant:update', cb); },
			destroy: function (cb) { Socket.on('participant:destroy', cb); },

			join: function (cb) { Socket.on('participant:join', cb); },
			leave: function (cb) { Socket.on('participant:leave', cb); },
			connect: function (cb) { Socket.on('participant:connect', cb); },
			disconnect: function (cb) { Socket.on('participant:disconnect', cb); },
			revoke: function (cb) { Socket.on('participant:revoke', cb); },
			promote: function (cb) { Socket.on('participant:promote', cb); }
		},

		topic: {
			create: function (cb) { Socket.on('topic:create', cb); },
			update: function (cb) { Socket.on('topic:update', cb); },
			destroy: function (cb) { Socket.on('topic:destroy', cb); }
		},

		message: {
			create: function (cb) { Socket.on('message:create', cb); },
			update: function (cb) { Socket.on('message:update', cb); },
			destroy: function (cb) { Socket.on('message:destroy', cb); }
		},

		recipient: {
			create: function (cb) { Socket.on('recipient:create', cb); },
			update: function (cb) { Socket.on('recipient:update', cb); },
			destroy: function (cb) { Socket.on('recipient:destroy', cb); }
		},

		subject: {
			create: function (cb) { Socket.on('subject:create', cb); },
			update: function (cb) { Socket.on('subject:update', cb); },
			destroy: function (cb) { Socket.on('subject:destroy', cb); }
		}
	};
});

app.factory('Users', function (Provider, Request, Event, Log, Notification) {
	var me = false;

	var users = Provider('user', function (data, cb) {
		cb(null, data);
	}, function (id, cb) {
		Request.user.read(id, cb);
	});

	users['me'] = function (cb) {
		if (me) return users.by(me, cb);

		Request.user.me(function (err, data) {
			if (err) return cb(err);
			me = data.id;
			users.add(data, cb);
		});
	}

	Event.user.create(function (event) {
		users.add(event.data, function (err, user) {
			if (err) return Notification.error(err);
		});
	});

	Event.user.update(function (event) {
		users.modify(event.data, function (err, user) {
			if (err) return Notification.error(err);
		});
	});

	Event.user.destroy(function (event) {
		users.remove(event.data, function (err, user) {
			if (err) return Notification.error(err);
		});
	});

	return users;
});

app.factory('Chats', function (Provider, Request, Event, Log, Notification, PubSub, Users, Participants, Topics, Messages) {
	var chats = new Provider('chat', function (data, cb) {
		data.participants = [];
		data.topics = [];
		data.messages = [];

		async.parallel([
			function (done) {
				Request.chat.participants(data.id, function (err, list) {
					if (err) return done(err);
					if (list.length < 1) return done();

					async.each(list, function (item, next) {
						Participants.add(item, function (err, participant) {
							if (err) return next(err);
							data.participants.push(participant);
							next();
						});
					}, function (err) {
						if (err) return done(err);
						done();
					});
				});
			},
			function (done) {
				Request.chat.topics(data.id, function (err, list) {
					if (err) return done(err);
					if (list.length < 1) return done();

					async.each(list, function (item, next) {
						Topics.add(item, function (err, topic) {
							if (err) return next(err);
							data.topics.push(topic);
							next();
						});
					}, function (err) {
						if (err) return done(err);
						done();
					});
				});
			},
			function (done) {
				Request.chat.messages(data.id, function (err, list) {
					if (err) return done(err);
					if (list.length < 1) return done();

					async.each(list, function (item, next) {
						Messages.add(item, function (err, message) {
							if (err) return next(err);
							data.messages.push(message);
							next();
						});
					}, function (err) {
						if (err) return done(err);
						done();
					});
				});
			}
		],
		function (err, results) {
			if (err) return cb(err);
			Users.me(function (err, me) {
				if (err) return cb(err);
				data.me = _.find(data.participants, function(participant) {
					return participant.user.id == me.id;
				});

				Users.by(data.owner, function (err, user) {
					if (err) return cb(err);
					data.owner = user;
					cb(null, data);
				});
			});
		});
	}, function (id, cb) {
		Request.chat.read(id, cb);
	});

	Event.chat.create(function (event) {
		chats.add(event.data, function (err, chat) {
			if (err) return Notification.error(err);
		});
	});

	Event.chat.update(function (event) {
		chats.modify(event.data, function (err, chat) {
			if (err) return Notification.error(err);
		});
	});

	Event.chat.destroy(function (event) {
		chats.remove(event.data, function (err, chat) {
			if (err) return Notification.error(err);
		});
	});

	Event.chat.icebreak(function (event) {
		Participants.add(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	Event.chat.invite(function (event) {
		Participants.add(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	PubSub.subscribe('participant:created', function (participant) {
		if (!chats.exists(participant.chat)) return;
		chats.by(participant.chat, function (err, chat) {
			if (err) return Notification.error(err);
			chat.participants.push(participant);
		});
	});

	PubSub.subscribe('message:created', function (message) {
		if (!chats.exists(message.chat)) return;
		chats.by(message.chat, function (err, chat) {
			if (err) return Notification.error(err);
			chat.messages.push(message);
		});
	});

	PubSub.subscribe('topic:created', function (topic) {
		if (!chats.exists(topic.chat)) return;
		chats.by(topic.chat, function (err, chat) {
			if (err) return Notification.error(err);
			chat.topics.push(topic);
		});
	});

	return chats;
});

app.factory('Participants', function (Provider, Request, Event, Log, Notification, Users) {
	var participants = Provider('participant', function (data, cb) {
		Users.by(data.user, function (err, user) {
			if (err) return cb(err);
			data.user = user;
			cb(null, data);
		});
	}, function (id, cb) {
		Request.participant.read(id, cb);
	});

	Event.participant.create(function (event) {
		participants.add(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	Event.participant.update(function (event) {
		participants.modify(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	Event.participant.destroy(function (event) {
		participants.destroy(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	Event.participant.join(function (event) {
		participants.modify(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	Event.participant.leave(function (event) {
		participants.modify(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	Event.participant.connect(function (event) {
		participants.modify(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	Event.participant.disconnect(function (event) {
		participants.modify(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	Event.participant.revoke(function (event) {
		participants.remove(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	Event.participant.promote(function (event) {
		participants.modify(event.data, function (err, participant) {
			if (err) return Notification.error(err);
		});
	});

	return participants;
});

app.factory('Topics', function (Provider, Request, Event, Log, Notification) {
	var topics = Provider('topic', function (data, cb) {
		cb(null, data);
	}, function (id, cb) {
		Request.topic.read(id);
	});

	Event.topic.create(function (event) {
		topics.add(event.data, function (err, topic) {
			if (err) return Notification.error(err);
		});
	});

	Event.topic.update(function (event) {
		topics.put(event.data, function (err, topic) {
			if (err) return Notification.error(err);
		});
	});

	Event.topic.destroy(function (event) {
		topics.remove(event.data, function (err, topic) {
			if (err) return Notification.error(err);
		});
	});

	return topics;
});

app.factory('Messages', function (Provider, Request, Event, Log, Notification, Users, Recipients, Subjects) {
	var messages = Provider('message', function (data, cb) {
		data.recipients = [];
		data.subjects = [];

		async.parallel([
			function (done) {
				Request.message.recipients(data.id, function (err, list) {
					if (err) return done(err);
					if (list.length < 1) return done();

					async.each(list, function (item, next) {
						Recipients.add(item, function (err, recipient) {
							if (err) return next(err);
							data.recipients.push(recipient);
							next();
						});
					}, function (err) {
						if (err) return done(err);
						done();
					});
				});
			},
			function (done) {
				Request.message.subjects(data.id, function (err, list) {
					if (err) return done(err);
					if (list.length < 1) return done();

					async.each(list, function (item, next) {
						Subjects.add(item, function (err, subject) {
							if (err) return next(err);
							data.subjects.push(subject);
							next();
						});
					}, function (err) {
						if (err) return done(err);
						done();
					});
				});
			}
		],
		function (err, results) {
			if (err) return cb(err);
			Users.by(data.owner, function (err, user) {
				if (err) return cb(err);
				data.owner = user;
				cb(null, data);
			});
		});
	}, function (id, cb) {
		Request.message.read(id, cb);
	});

	Event.message.create(function (event) {
		messages.add(event.data, function (err, message) {
			if (err) return Notification.error(err);
		});
	});

	Event.message.update(function (event) {
		messages.put(event.data, function (err, message) {
			if (err) return Notification.error(err);
		});
	});

	Event.message.destroy(function (event) {
		messages.remove(event.data, function (err, message) {
			if (err) return Notification.error(err);
		});
	});

	return messages;
});

app.factory('Recipients', function (Provider, Request, Event, Log, Notification, Users) {
	var recipients = Provider('recipient', function (data, cb) {
		Users.by(data.user, function (err, user) {
			if (err) return cb(err);
			data.user = user;
			cb(null, data);
		});
	}, function (id, cb) {
		Request.topic.read(id);
	});

	Event.recipient.create(function (event) {
		recipients.add(event.data, function (err, recipient) {
			if (err) return Notification.error(err);
		});
	});

	Event.recipient.update(function (event) {
		recipients.put(event.data, function (err, recipient) {
			if (err) return Notification.error(err);
		});
	});

	Event.recipient.destroy(function (event) {
		recipients.remove(event.data, function (err, recipient) {
			if (err) return Notification.error(err);
		});
	});

	return recipients;
});

app.factory('Subjects', function (Provider, Request, Event, Log, Notification, Topics) {
	var subjects = Provider('subject', function (data, cb) {
		Topics.by(data.topic, function (err, topic) {
			if (err) return cb(err);
			data.topic = topic;
			cb(null, data);
		});
	}, function (id, cb) {
		Request.topic.read(id);
	});

	Event.subject.create(function (event) {
		subjects.add(event.data, function (err, subject) {
			if (err) return Notification.error(err);
		});
	});

	Event.subject.update(function (event) {
		subjects.put(event.data, function (err, subject) {
			if (err) return Notification.error(err);
		});
	});

	Event.subject.destroy(function (event) {
		subjects.remove(event.data, function (err, subject) {
			if (err) return Notification.error(err);
		});
	});

	return subjects;
});

/*********************************/
/****** D I R E C T I V E S ******/
/*********************************/

app.directive('message', function () {
	return {
		templateUrl: '/chat/templates/partials/message',
	}
});

app.directive('date', function ($timeout) {
	return {
		restrict: 'E',
		scope: {
			format: '@',
			time:'@',
			refresh: '@'
		},
		link: function (scope, element, attrs) {
			function update() { element.text(moment(scope.time).fromNow()); $timeout(update, 60000); }
			update();
			element.attr('title', moment(scope.time).format(scope.format))
		}
	}
});

/*********************************/
/********* F I L T E R S *********/
/*********************************/

app.filter('legitChat', function () {
	return function (items) {
		return _.where(items, function (chat) { return chat.me.type != 'invite' && chat.me.type != 'icebreak'; });
	};
});

app.filter('icebreakChat', function () {
	return function (items) {
		return _.where(items, function (chat) { return chat.me.type == 'icebreak'; });
	};
});

app.filter('inviteChat', function () {
	return function (items) {
		return _.where(items, function (chat) { return chat.me.type == 'invite'; });
	};
});

app.filter('connectedChat', function () {
	return function (items) {
		return _.where(items, function (chat) { return chat.me.connected; });
	};
});

app.filter('legitParticipant', function () {
	return function (items) {
		return _.where(items, function (participant) { return participant.type != 'invite' && participant.type != 'icebreak'; });
	};
});

app.filter('inviteParticipant', function () {
	return function (items) {
		return _.where(items, function (participant) { return participant.type == 'invite'; });
	};
});

app.filter('icebreakParticipant', function () {
	return function (items) {
		return _.where(items, function (participant) { return participant.type == 'icebreak'; });
	};
});

/*********************************/
/***** C O N T R O L L E R S *****/
/*********************************/

app.controller('AppController', function ($scope, $routeParams, Redirect, Chats, Users, Request, Notification) {
	/*********************************/
	/******* V A R I A B L E S *******/
	/*********************************/

	// reference for further usage
	var self = this;

	// available chats
	self.chats = false;

	// current chat
	self.chat = false;

	// errors
	self.errors = {};

	// types
	self.types = ['icebreak', 'invite', 'mute', 'voice', 'moderator', 'admin', 'creator'];

	/*********************************/
	/********* F I L T E R S *********/
	/*********************************/

	self.isStaff = function () { return _.indexOf(self.types, 'moderator') <= _.indexOf(self.types, self.chat.me.type); }
	self.isSuperiorTo = function (participant) { return _.indexOf(self.types, participant.type) < _.indexOf(self.types, self.chat.me.type); }

	/*********************************/
	/******* F U N C T I O N S *******/
	/*********************************/

	self.casual = function (err) {
		self.errors = [];

		if (err.status == 400) {
			Notification.warning(err);
			self.errors = err.validationErrors;
		}

		else if (err.status == 403) {
			Notification.error('Forbidden');
		}

		else if (err.status == 404) {
			Notification.error('Not found');
		}

		else {
			Notification.error(err);
			return true;
		}

		return false;
	}

	self.critical = function (err) {
		if (self.casual(err)) Redirect.crash();
	}

	self.create = function (newChat) {
		Request.chat.create(newChat, function (err, chat) {
			if (err) return self.casual(err);

			self.newChat = {};
			self.to('/');
		});
	}

	self.icebreak = function (slug) {
		Request.chat.icebreak(slug, function (err, participant) {
			if (err) return self.casual(err);

			self.to('/');
		});
	}

	self.invite = function (chat, newParticipant) {
		Request.chat.invite(chat.id, newParticipant, function (err, participant) {
			if (err) return self.casual(err);
			$scope.newParticipant = "";
		});
	}

	self.accept = function (newParticipant) {
		Request.chat.invite(newParticipant.chat, newParticipant.user.username, function (err, participant) {
			if (err) return self.casual(err);
		});
	}

	self.join = function (chat) {
		Request.participant.join(chat.me.id, function (err, participant) {
			if (err) return self.casual(err);
		});
	}

	self.leave = function (chat) {
		Request.participant.leave(chat.me.id, function (err, participant) {
			if (err) return self.casual(err);
			Chats.remove(participant.chat, function (err, chat) {
				self.toLastChat();
			});
		});
	}

	self.connect = function (chat) {
		if (chat.me.connected) return;

		Request.participant.connect(chat.me.id, function (err, participant) {
			if (err) return self.casual(err);
		});
	}

	self.disconnect = function (chat) {
		Request.participant.disconnect(chat.me.id, function (err, disconnect) {
			if (err) return self.casual(err);

			self.toLastChat();
		});
	}

	self.revoke = function (participant) {
		Request.participant.revoke(participant.id, function (err, participant) {
			if (err) return self.casual(err);

			Users.me(function (err, me) {
				if (err) return self.casual(err);

				if (me.id == participant.user.id) {
					self.to('/');
				}
			});

		});
	}

	self.promote = function (participant, type) {
		Request.chat.promote(participant.id, type, function (err, participant) {
			if (err) return self.casual(err);
		});
	}

	self.send = function (chat, newMessage) {
		newMessage.chat = chat.id;

		Request.message.create(newMessage, function (err, message) {
			if (err) return self.casual(err);
			$scope.newMessage = "";
		});
	}

	self.topic = function (chat, newTopic) {

		newTopic.owner = Users.me(function (err, me) {
			if (err) return self.casual(err);

			newTopic.chat = chat.id;
			newTopic.owner = me.id;

			Request.topic.create(newTopic, function (err, topic) {
				if (err) return self.casual(err);
				$scope.newTopic = {};
			});
		});
	}

	/*self.untopic = function (topic) {
		Request.topic.destroy(topic.id, function (err, topic) {
			if (err) return self.casual(err);
		});
	}*/

	self.to = function (to) { Redirect.to(to); }

	self.toLastChat = function () {
		var chat = _(self.chats).find(function (chat) { return chat.me.connected; });
		if (chat) self.to('/chat/' + chat.slug);
		else self.to('/');
	}

	/*********************************/
	/************ I N I T ************/
	/*********************************/

	Chats.any(function (err, chats) {
		if (err) return self.critical(err);
		self.chats = chats;
		if ($routeParams.slug) {
			if (self.chat = _.find(self.chats, {slug: $routeParams.slug})) return self.connect(self.chat);
			self.icebreak($routeParams.slug);
		}
	});
});