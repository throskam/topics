# Topics

## Motivation
Trying out Node.js and Socket.io

## Description
An instantaneous online chat with persistent historics and topic structure to easily group messages by subjects.

## Stacks

__Server__ :

- Node.js
- Sails.js
- Async.js

__Client__ :

- jQuery.js
- Bootstrap.js
- Moment.js
- Async.js
- Lodash.js
- Socket.io.js
- Angular.js

## Socket

Socket.io methods and protocols

### Request

Send a request to the server (socket.emit())

__Format__ : JSON Object with the requested url and the POSTed data.

	{
		url: STRING,
		data: OBJECT
	}

__API__ : list of requestable url

	get    /api/user/me

	get    /api/user
	post   /api/user
	get    /api/user/:user
	put    /api/user/:user
	delete /api/user/:user

	get    /api/chat
	post   /api/chat
	get    /api/chat/:chat
	put    /api/chat/:chat
	delete /api/chat/:chat

	get    /api/chat/:chat/participants
	get    /api/chat/:chat/topics
	get    /api/chat/:chat/messages

	put    /api/chat/icebreak/:slug
	put    /api/chat/:chat/invite/:user

	get    /api/participant
	post   /api/participant
	get    /api/participant/:participant
	put    /api/participant/:participant
	delete /api/participant/:participant

	put    /api/participant/:participant/join
	put    /api/participant/:participant/leave
	put    /api/participant/:participant/connect
	put    /api/participant/:participant/disconnect
	put    /api/participant/:participant/revoke
	put    /api/participant/:participant/promote

	get    /api/topic
	post   /api/topic
	get    /api/topic/:topic
	put    /api/topic/:topic
	delete /api/topic/:topic

	get    /api/message
	post   /api/message
	get    /api/message/:message
	put    /api/message/:message
	delete /api/message/:message

	get    /api/message/:message/subjects
	get    /api/message/:message/recipients

	get    /api/recipient
	post   /api/recipient
	get    /api/recipient/:recipient
	put    /api/recipient/:recipient
	delete /api/recipient/:recipient

	get    /api/subject
	post   /api/subject
	get    /api/subject/:subject
	put    /api/subject/:subject
	delete /api/subject/:subject

This is automatically routed as any other request in Sails.js.

__Response__ : JSON Object containing the expected result or an error with the following structure

	{
		status: INT,
		[ validationErrors: OBJECT ]
		[ error: STRING ]
		[ ... ]
	}


### Events

Receive a message from the server (socket.on())

__Format__ : JSON Object representing an event

	{
		event: STRING,
		data: OBJECT
	}

Errors are either an array of string or an object if it's validation errors.

__Events__ : List of available events

	user:create
	user:update
	user:destroy

	chat:create
	chat:update
	chat:destroy

	chat:icebreak
	chat:invite

	participant:create
	participant:update
	participant:destroy

	participant:join
	participant:leave
	participant:connect
	participant:disconnect
	participant:revoke
	participant:promote

	topic:create
	topic:update
	topic:destroy

	message:create
	message:update
	message:destroy

	recipient:create
	recipient:update
	recipient:destroy

	subject:create
	subject:update
	subject:destroy
