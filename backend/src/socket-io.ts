import passport from 'passport';
import { Server } from 'socket.io';
import { sessionMiddleware } from './middlewares/session.js';
// import { Chat } from './models/Chat.js';
import { wrap } from './libs/wrap.js';
import { IContact } from './global.js';
// import { User } from './models/User.js';

export const sockets = (io: Server) => {
	io.use(wrap(sessionMiddleware));
	io.use(wrap(passport.initialize()));
	io.use(wrap(passport.session()));
	
	io.use((socket, next) => {
		if (socket.request.user && socket.handshake.auth.id) {
			return next();
		}
		else return(new Error('Unauthorized'));
	});

	io.on('connection', async (socket) => {
		const contacts: IContact[] = [];

		const userContacts = socket.request.user.contacts;

		for (const [id, socket] of io.of('/').sockets) {
			const foreignUserId = socket.request.user._id;
			console.log(socket.request.user.username);

			if (userContacts.includes(foreignUserId)) {
				contacts.push({
					userId: id,
					username: socket.request.user.username,
					email: socket.request.user.email,
					avatar: socket.request.user.avatar,
					description: socket.request.user.description
				});
			}
		}
		
		socket.emit('loadContacts', contacts);

		// socket.on('message', async (message) => {
		// 	const newMessage = await Chat.create({
		// 		body: message,
		// 		from: socket.request.user.username,
		// 		createdAt: new Date
		// 	});

		// 	socket.emit('message', newMessage);

		// 	socket.broadcast.emit('message', newMessage);
		// });

		// socket.on('delete', async (_id: string) => {
		// 	await Chat.deleteOne({
		// 		_id,
		// 		from: socket.request.user.username
		// 	});

		// 	socket.broadcast.emit('delete', _id);
		// });
	});
};
