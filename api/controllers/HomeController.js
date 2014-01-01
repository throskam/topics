
module.exports = {
	/*************************************************************************/
	/******************** R E S T F U L   V I E W S **************************/
	/*************************************************************************/

	getIndex: function (req, res) {
		res.view('home/index');
	},

	getNews: function (req, res) {
		res.view('home/news');
	},

	getStatistics: function (req, res) {
		async.parallel([
			function (cb) { User.count().done(function (err, count) { cb(err, count); }); },
			function (cb) { cb(null, _.unique(_.values(sails.io.sockets.sockets), false, function (socket) { return Socket.socketToUser(socket.id).id; }).length); },
			function (cb) { Chat.count().done(function (err, count) { cb(err, count); }); },
			function (cb) { Message.count().done(function (err, count) { cb(err, count); }); },
		], function (err, results) {
			if (err) return res.serverError(err, req, res);

			var stats = {};

			stats.users = results[0];
			stats.usersConnected = results[1];
			stats.chats = results[2];
			stats.messages = results[3];

			res.view('home/statistics', { stats: stats });
		});
	},

	getContact: function (req, res) {
		res.view('home/contact');
	}
};
