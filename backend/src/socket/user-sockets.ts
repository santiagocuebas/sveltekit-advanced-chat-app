import type { UserSockets } from '../types/sockets.js';
import { User } from '../models/index.js';
import { actUser, deleteChats } from '../libs/update-user.js';

export const userSockets: UserSockets = (socket, [userID, contactID, roomID], user) => {
	socket.on('emitLeave', async () => {
		socket.to(roomID).emit('leaveUser', userID, roomID, true);

		// Remove user id to the contact
		await User.updateOne({ _id: contactID }, { $pull: { users: { userID } } });

		user = actUser(contactID, roomID, user);

		// Remove contact id to the user
		await User.updateOne({ _id: userID }, { users: user.users });

		socket.leave(roomID);
	});

	socket.on('emitBlock', async () => {
		socket.to(roomID).emit('leaveUser', userID, roomID, true);

		// Remove user id to the contact
		const foreignUser = await User.findOneAndUpdate(
			{ _id: contactID },
			{ $pull: { users: { userID } } }
		);

		user = actUser(contactID, roomID, user, foreignUser?.username);

		// Remove and block contact id to the user
		await User.updateOne(
			{ _id: userID },
			{ users: user.users, blockedUsers: user.blockedUsers }
		);
		
		socket.leave(roomID);
	});

	socket.on('emitDestroy', async () => {
		socket.to(roomID).emit('leaveUser', userID, roomID, true);

		// Remove user id to the contact
		await User.updateOne({ _id: contactID }, { $pull: { users: { userID } } });

		user = actUser(contactID, roomID, user);

		// Remove contact id to the user
		await User.updateOne({ _id: userID }, { users: user.users });

		// Delete chats
		await deleteChats(userID, contactID);

		socket.leave(roomID);
	});

	socket.on('emitBlockDestroy', async () => {
		socket.to(roomID).emit('leaveUser', userID, roomID, true);

		// Remove user id to the contact
		const foreignUser = await User.findOneAndUpdate(
			{ _id: contactID },
			{ $pull: { users: { userID } } }
		);

		user = actUser(contactID, roomID, user, foreignUser?.username);

		// Remove and block contact id to the user
		await User.updateOne(
			{ _id: userID },
			{ users: user.users, blockedUsers: user.blockedUsers }
		);

		// Delete chats
		await deleteChats(userID, contactID);
		
		socket.leave(roomID);
	});
};
