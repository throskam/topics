
module.exports.routes = {

	/*************************************************************************/
	/******************** R E S T F U L   V I E W S **************************/
	/*************************************************************************/

	'get    /'                                        : 'HomeController.getIndex',
	'get    /news'                                    : 'HomeController.getNews',
	'get    /statistics'                              : 'HomeController.getStatistics',
	'get    /contact'                                 : 'HomeController.getContact',

	'get    /auth/signin'                             : 'AuthController.getSignin',
	'post   /auth/signin'                             : 'AuthController.postSignin',
	'get    /auth/signup'                             : 'AuthController.getSignup',
	'post   /auth/signup'                             : 'AuthController.postSignup',
	'get    /auth/signout'                            : 'AuthController.postSignout',
	'post   /auth/signout'                            : 'AuthController.postSignout',

	'get    /user/profile'                            : 'UserController.getProfile',
	'get    /user/settings'                           : 'UserController.getSettings',
	'post   /user/settings'                           : 'UserController.postSettings',

	'get    /chat'                                    : 'ChatController.getIndex',
	'get    /chat/templates/home'                     : 'ChatController.getHome',
	'get    /chat/templates/create'                   : 'ChatController.getCreate',
	'get    /chat/templates/read'                     : 'ChatController.getRead',
	'get    /chat/templates/500'                      : 'ChatController.get500',
	'get    /chat/templates/partials/user'            : 'ChatController.getUser',
	'get    /chat/templates/partials/message'         : 'ChatController.getMessage',

	/*************************************************************************/
	/********************** R E S T F U L   A P I ****************************/
	/*************************************************************************/

	'get    /api/user/me'                             : 'UserController.me',

	'get    /api/user'                                : 'UserController.find',
	'post   /api/user'                                : 'UserController.create',
	'get    /api/user/:user'                          : 'UserController.read',
	'put    /api/user/:user'                          : 'UserController.update',
	'delete /api/user/:user'                          : 'UserController.destroy',

	'get    /api/chat'                                : 'ChatController.find',
	'post   /api/chat'                                : 'ChatController.create',
	'get    /api/chat/:chat'                          : 'ChatController.read',
	'put    /api/chat/:chat'                          : 'ChatController.update',
	'delete /api/chat/:chat'                          : 'ChatController.destroy',

	'get    /api/chat/:chat/participants'             : 'ChatController.participants',
	'get    /api/chat/:chat/topics'                   : 'ChatController.topics',
	'get    /api/chat/:chat/messages'                 : 'ChatController.messages',

	'put    /api/chat/icebreak/:slug'                 : 'ChatController.icebreak',
	'put    /api/chat/:chat/invite/:user'             : 'ChatController.invite',

	'get    /api/participant'                         : 'ParticipantController.find',
	'post   /api/participant'                         : 'ParticipantController.create',
	'get    /api/participant/:participant'            : 'ParticipantController.read',
	'put    /api/participant/:participant'            : 'ParticipantController.update',
	'delete /api/participant/:participant'            : 'ParticipantController.destroy',

	'put    /api/participant/:participant/join'       : 'ParticipantController.join',
	'put    /api/participant/:participant/leave'      : 'ParticipantController.leave',
	'put    /api/participant/:participant/connect'    : 'ParticipantController.connect',
	'put    /api/participant/:participant/disconnect' : 'ParticipantController.disconnect',
	'put    /api/participant/:participant/revoke'     : 'ParticipantController.revoke',
	'put    /api/participant/:participant/promote'    : 'ParticipantController.promote',

	'get    /api/topic'                               : 'TopicController.find',
	'post   /api/topic'                               : 'TopicController.create',
	'get    /api/topic/:topic'                        : 'TopicController.read',
	'put    /api/topic/:topic'                        : 'TopicController.update',
	'delete /api/topic/:topic'                        : 'TopicController.destroy',

	'get    /api/message'                             : 'MessageController.find',
	'post   /api/message'                             : 'MessageController.create',
	'get    /api/message/:message'                    : 'MessageController.read',
	'put    /api/message/:message'                    : 'MessageController.update',
	'delete /api/message/:message'                    : 'MessageController.destroy',

	'get    /api/message/:message/subjects'           : 'MessageController.subjects',
	'get    /api/message/:message/recipients'         : 'MessageController.recipients',

	'get    /api/recipient'                           : 'RecipientController.find',
	'post   /api/recipient'                           : 'RecipientController.create',
	'get    /api/recipient/:recipient'                : 'RecipientController.read',
	'put    /api/recipient/:recipient'                : 'RecipientController.update',
	'delete /api/recipient/:recipient'                : 'RecipientController.destroy',

	'get    /api/subject'                             : 'SubjectController.find',
	'post   /api/subject'                             : 'SubjectController.create',
	'get    /api/subject/:subject'                    : 'SubjectController.read',
	'put    /api/subject/:subject'                    : 'SubjectController.update',
	'delete /api/subject/:subject'                    : 'SubjectController.destroy'
};