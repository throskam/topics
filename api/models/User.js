var bcrypt = require('bcrypt');

module.exports = {

	schema: true,

	attributes: {
		username: {
			type: 'string',
			required: true,
			alphanumeric: true
		},

		password: {
			type: 'string',
			required: true,
			minLength: 8
		},

		email: {
			type: 'email'
		},

		dateFormat: {
			type: 'string',
			notEmpty: true,
			maxLength: 255,
			defaultsTo: 'lll'
		},

		lastSeen: {
			type: 'datetime'
		},

		toJSON: function () {
			var obj = this.toObject();
			delete obj.password;
			return obj;
		},

		auth: function (password, done) {
			bcrypt.compare(password, this.password, done);
		}
	},

	notify: function (socket, users) {
		Socket.notify(User, socket, users);
	},

	publishCreate: function (values) {
		// TODO: publish create user
	},

	publishUpdate: function (id, changes) {
		// TODO: publish update user
	},

	publishDestroy: function (values) {
		// TODO: publish destroy user
	},

	beforeCreate: function (values, cb) {
		bcrypt.hash(values.password, 10, function (err, hash) {
			if (err) return cb(err);
			values.password = hash;
			cb();
		});
	},

	beforeUpdate: function (values, cb) {
		if (values.password) {
			bcrypt.hash(values.password, 10, function (err, hash) {
				if (err) return cb(err);
				values.password = hash;
			});
		}

		cb();
	},

	beforeDestroy: function (criteria, cb) {
		// TODO: before destroy
		cb();
	}
};
