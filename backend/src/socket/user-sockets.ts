import type { UserSockets } from '../types/sockets.js';
import { ErrorMessage } from '../dictionary.js';
import { actUser, deleteChats } from '../libs/index.js';
import { User } from '../models/index.js';
import { QueryOption } from '../types/enums.js';

export const userSockets: UserSockets = (
	socket,
	[userID, contactID, roomID],
	user
) => {
	socket.on('emitLeave', async () => {
		try {
			// Remove user id to the contact
			await User.updateOne({ _id: contactID }, { $pull: { users: { userID } } });
		
			user = actUser(contactID, roomID, user);
	
			// Remove contact id to the user
			await User.updateOne({ _id: userID }, { users: user.users });
	
			socket.to(roomID).emit('leaveUser', userID, roomID);
			socket.leave(roomID);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitBlock', async () => {
		try {
			// Remove user id to the contact
			const foreignUser = await User
				.findOneAndUpdate({ _id: contactID }, { $pull: { users: { userID } } });
		
			user = actUser(contactID, roomID, user, foreignUser?.username);
	
			// Remove and block contact id to the user
			await User.updateOne(
				{ _id: userID },
				{ users: user.users, blockedUsers: user.blockedUsers });
		
			socket.to(roomID).emit('leaveUser', userID, roomID);
			socket.leave(roomID);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitDestroy', async () => {
		try {
			// Delete chats
			await deleteChats([contactID, userID], QueryOption.USER);
	
			// Remove user id to the contact
			await User.updateOne({ _id: contactID }, { $pull: { users: { userID } } });
		
			user = actUser(contactID, roomID, user);
	
			// Remove contact id to the user
			await User.updateOne({ _id: userID }, { users: user.users });
		
			socket.to(roomID).emit('leaveUser', userID, roomID);
			socket.leave(roomID);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitBlockDestroy', async () => {
		try {
			// Delete chats
			await deleteChats([contactID, userID], QueryOption.USER);
	
			// Remove user id to the contact
			const foreignUser = await User
				.findOneAndUpdate({ _id: contactID }, { $pull: { users: { userID } } });
		
			user = actUser(contactID, roomID, user, foreignUser?.username);
	
			// Remove and block contact id to the user
			await User.updateOne(
				{ _id: userID },
				{ users: user.users, blockedUsers: user.blockedUsers });
		
			socket.to(roomID).emit('leaveUser', userID, roomID);
			socket.leave(roomID);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});
};
