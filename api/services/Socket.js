
module.exports = {
	userToSockets: function (id, pool) {
		var sockets = [];

		_.each(pool || sails.io.sockets.sockets, function (socket) {
			if (socket.manager.handshaken[socket.id].session.user.id == id) sockets.push(socket);
		}, this);

		return sockets;
	},

	socketToUser: function (key) { return sails.io.handshaken[key].session.user; },

	// emit
	publish: function (event, sockets) { _.each(sockets, function (socket) { socket.emit(event.name, event); }); },

	// join room
	introduce: function (room, sockets) { _.each(sockets, function (socket) { socket.join(room); }); },

	// leave room
	obituary: function (room, sockets) { _.each(sockets, function (socket) { socket.leave(room); }); },

	// subscribe socket for a global model room and optionally specific instance rooms.
	notify: function (Model, socket, items) {
		if (sails.config.hooks.pubsub && !Model.silent) {
			Model.subscribe(socket);
			if (items) Model.subscribe(socket, items);
		}
	}
}