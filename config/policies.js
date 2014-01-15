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

		'find': ['isAuthenticated', 'notYetImplemented'],
		'create': ['isAuthenticated', 'notYetImplemented'],
		'read': ['isAuthenticated'],
		'update': ['isAuthenticated', 'notYetImplemented'],
		'destroy': ['isAuthenticated', 'notYetImplemented'],

		'me': ['isAuthenticated']
	},

	ChatController: {
		'*': false,

		'getIndex': ['isAuthenticated', 'locals'],

		'getHome': ['isAuthenticated', 'locals'],
		'getCreate': ['isAuthenticated', 'locals'],
		'getRead': ['isAuthenticated', 'locals'],
		'get500': ['isAuthenticated', 'locals'],
		'getParticipant': ['isAuthenticated', 'locals'],
		'getTopic': ['isAuthenticated', 'locals'],
		'getMessage': ['isAuthenticated', 'locals'],

		'find': ['isAuthenticated'],
		'create': ['isAuthenticated'],
		'read': ['isAuthenticated', 'permissions'],
		'update': ['isAuthenticated', 'notYetImplemented'],
		'destroy': ['isAuthenticated', 'notYetImplemented'],

		'participants': ['isAuthenticated', 'permissions'],
		'topics': ['isAuthenticated', 'permissions'],
		'messages': ['isAuthenticated', 'permissions'],

		'icebreak': ['isAuthenticated'],
		'invite': ['isAuthenticated', 'permissions'],
	},

	ParticipantController: {
		'*': false,

		'find': ['isAuthenticated', 'notYetImplemented'],
		'create': ['isAuthenticated', 'notYetImplemented'],
		'read': ['isAuthenticated', 'permissions'],
		'update': ['isAuthenticated', 'notYetImplemented'],
		'destroy': ['isAuthenticated', 'notYetImplemented'],

		'join': ['isAuthenticated', 'permissions' ],
		'leave': ['isAuthenticated', 'permissions'],
		'connect': ['isAuthenticated', 'permissions'],
		'disconnect': ['isAuthenticated', 'permissions'],
		'promote': ['isAuthenticated', 'permissions'],
		'revoke': ['isAuthenticated', 'permissions'],
	},

	TopicController: {
		'*': false,

		'find': ['isAuthenticated', 'notYetImplemented'],
		'create': ['isAuthenticated', 'permissions'],
		'read': ['isAuthenticated', 'notYetImplemented'],
		'update': ['isAuthenticated', 'notYetImplemented'],
		'destroy': ['isAuthenticated', 'permissions'],
	},

	MessageController: {
		'*': false,

		'find': ['isAuthenticated', 'notYetImplemented'],
		'create': ['isAuthenticated', 'permissions'],
		'read': ['isAuthenticated', 'notYetImplemented'],
		'update': ['isAuthenticated', 'notYetImplemented'],
		'destroy': ['isAuthenticated', 'notYetImplemented'],

		'subjects': ['isAuthenticated', 'permissions'],
		'recipients': ['isAuthenticated', 'permissions'],
	},

	RecipientController: {
		'*': false,

		'find': ['isAuthenticated', 'notYetImplemented'],
		'create': ['isAuthenticated', 'notYetImplemented'],
		'read': ['isAuthenticated', 'notYetImplemented'],
		'update': ['isAuthenticated', 'notYetImplemented'],
		'destroy': ['isAuthenticated', 'notYetImplemented'],
	},

	SubjectController: {
		'*': false,

		'find': ['isAuthenticated', 'notYetImplemented'],
		'create': ['isAuthenticated', 'notYetImplemented'],
		'read': ['isAuthenticated', 'notYetImplemented'],
		'update': ['isAuthenticated', 'notYetImplemented'],
		'destroy': ['isAuthenticated', 'notYetImplemented'],
	}
};