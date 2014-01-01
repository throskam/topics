module.exports.policies = {

	'*': false,

	HomeController: {
		'*': false,

		'getIndex': ['locals'],
		'getNews': ['locals'],
		'getStatistics': ['locals'],
		'getContact': ['locals'],
	},

	AuthController: {
		'*': false,

		'getSignin': ['locals'],
		'postSignin': true,
		'getSignup': ['locals'],
		'postSignup': true,
		'postSignout': true,
	},

	UserController: {
		'*': false,

		'getProfile': ['isAuthenticated', 'locals'],
		'getSettings': ['isAuthenticated', 'locals'],
		'postSettings': ['isAuthenticated'],

		'find': ['isAuthenticated'],
		'create': ['isAuthenticated'],
		'read': ['isAuthenticated'],
		'update': ['isAuthenticated'],
		'destroy': ['isAuthenticated'],

		'me': ['isAuthenticated']
	},

	ChatController: {
		'*': false,

		'getIndex': ['isAuthenticated', 'locals'],

		'getHome': ['isAuthenticated', 'locals'],
		'getCreate': ['isAuthenticated', 'locals'],
		'getRead': ['isAuthenticated', 'locals'],
		'get500': ['isAuthenticated', 'locals'],
		'getUser': ['isAuthenticated', 'locals'],
		'getMessage': ['isAuthenticated', 'locals'],

		'find': ['isAuthenticated'],
		'create': ['isAuthenticated'],
		'read': ['isAuthenticated'],
		'update': ['isAuthenticated'],
		'destroy': ['isAuthenticated'],

		'participants': ['isAuthenticated'],
		'topics': ['isAuthenticated'],
		'messages': ['isAuthenticated'],

		'icebreak': ['isAuthenticated'],
		'invite': ['isAuthenticated'],
	},

	ParticipantController: {
		'*': false,

		'find': ['isAuthenticated'],
		'create': ['isAuthenticated'],
		'read': ['isAuthenticated'],
		'update': ['isAuthenticated'],
		'destroy': ['isAuthenticated'],

		'join': ['isAuthenticated'],
		'leave': ['isAuthenticated'],
		'connect': ['isAuthenticated'],
		'disconnect': ['isAuthenticated'],
		'revoke': ['isAuthenticated'],
		'promote': ['isAuthenticated'],
	},

	TopicController: {
		'*': false,

		'find': ['isAuthenticated'],
		'create': ['isAuthenticated'],
		'read': ['isAuthenticated'],
		'update': ['isAuthenticated'],
		'destroy': ['isAuthenticated'],
	},

	MessageController: {
		'*': false,

		'find': ['isAuthenticated'],
		'create': ['isAuthenticated'],
		'read': ['isAuthenticated'],
		'update': ['isAuthenticated'],
		'destroy': ['isAuthenticated'],

		'subjects': ['isAuthenticated'],
		'recipients': ['isAuthenticated'],
	},

	RecipientController: {
		'*': false,

		'find': ['isAuthenticated'],
		'create': ['isAuthenticated'],
		'read': ['isAuthenticated'],
		'update': ['isAuthenticated'],
		'destroy': ['isAuthenticated'],
	},

	SubjectController: {
		'*': false,

		'find': ['isAuthenticated'],
		'create': ['isAuthenticated'],
		'read': ['isAuthenticated'],
		'update': ['isAuthenticated'],
		'destroy': ['isAuthenticated'],
	}
};