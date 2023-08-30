import type { IUser } from '../types/global.js';
import type { UserSockets } from '../types/sockets.js';
import { updateUser } from '../libs/index.js';
import { User, Chat } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const userSockets: UserSockets = (socket, [userID, contactID, roomID], users, userRooms, blacklist) => {
	socket.on('emitLeave', async () => {
		const user = await User.findOne({ _id: contactID }, 'users') as IUser;

		await updateUser(userID, contactID, users);
		await updateUser(contactID, userID, user.users);

		userRooms = userRooms.filter(id => id !== roomID);

		socket.to(roomID).emit('leaveUser', userID, roomID);
		socket.leave(roomID);
	});

	socket.on('emitBlock', async () => {
		const user = await User
			.findOne({ _id: contactID })
			.select('username users') as IUser;

		blacklist.push({
			id: contactID,
			name: user.username,
			type: TypeContact.USER
		});

		await updateUser(userID, contactID, users, blacklist);
		await updateUser(contactID, userID, user.users);

		userRooms = userRooms.filter(id => id !== roomID);
		
		socket.to(roomID).emit('leaveUser', userID, roomID);
		socket.leave(roomID);
	});

	socket.on('emitDestroy', async () => {
		const user = await User.findOne({ _id: contactID }, 'users') as IUser;

		await updateUser(userID, contactID, users);
		await updateUser(contactID, userID, user.users);

		Chat.deleteMany({
			$or: [
				{ from: userID, to: contactID },
				{ from: contactID, to: userID }
			]
		});

		userRooms = userRooms.filter(id => id !== roomID);
		
		socket.to(roomID).emit('leaveUser', userID, roomID);
		socket.leave(roomID);
	});

	socket.on('emitBlockDestroy', async () => {
		const user = await User
			.findOne({ _id: contactID })
			.select('username users') as IUser;

		blacklist.push({
			id: contactID,
			name: user.username,
			type: TypeContact.USER
		});

		await updateUser(userID, contactID, users, blacklist);
		await updateUser(contactID, userID, user.users);

		await Chat.deleteMany({
			$or: [
				{ from: userID, to: contactID },
				{ from: contactID, to: userID }
			]
		});

		userRooms = userRooms.filter(id => id !== roomID);
		
		socket.to(roomID).emit('leaveUser', userID, roomID);
		socket.leave(roomID);
	});

	return [userRooms, blacklist];
};
