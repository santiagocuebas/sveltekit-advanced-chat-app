import type { Socket } from 'socket.io';
import { getContacts } from './libs/index.js';
import { User, Group } from './models/index.js';
import {
	adminSockets,
	chatSockets,
	genericSockets,
	memberSockets,
	modSockets,
	userSockets
} from './socket/index.js';
import { socketIndex } from './validations/socket-index.js';
import { TypeContact } from './types/enums.js';

export default async (socket: Socket) => {
	console.log(socket.id, '==== connected');

	const emitArray = [
		'emitChat', 'emitDelete', 'emitLeave', 'emitBlock', 'emitDestroy', 'emitBlockDestroy', 'emitLeaveGroup', 'emitBlockGroup', 'emitAddMember', 'emitBanMember', 'emitBlockMember', 'emitUnblockMember', 'emitAddMod', 'emitRemoveMod', 'emitChangeAvatar', 'emitChangeDescription', 'emitChangeState', 'emitDestroyGroup'
	];
	const userID = socket.user.id;

	// Connecting user
	await User.updateOne({ _id: userID }, { logged: true, tempId: socket.id });

	// Connecting user to the group
	await Group.updateMany(
		{ _id: socket.user.groupRooms },
		{ $addToSet: { loggedUsers: userID } }
	);

	// Get data of the contacts
	const contacts = await getContacts(userID, socket.user);

	socket.join([...socket.user.userRooms, ...socket.user.groupRooms]);
	socket.emit('loadContacts', contacts);
	socket.to(socket.user.userRooms).emit('loggedUser', userID, true);
	socket.to(socket.user.groupRooms).emit('countMembers', userID, 1);
	
	socket.use(async ([event, ...args], next) => {
		console.log(event, args);

		if (typeof event === 'string' && socketIndex[event] !== undefined) {
			// Check if the event and arguments are valid
			const match = await socketIndex[event](args as never, socket.user);

			if (match === true) return next();

			socket.emit('socketError', match);
		} else {
			socket.emit('socketError', { error: 'Socket Error', message: 'The socket emitted no exist' });
		}
	});

	socket.on('joinUserRoom', async (contactID: string, roomID: string) => {
		// Joining to the user sockets
		emitArray.forEach(emitString => socket.removeAllListeners(emitString));
		const IDs = [userID, contactID, roomID];

		chatSockets(socket, IDs, TypeContact.USER);
		userSockets(socket, IDs, socket.user);
	});

	socket.on('joinGroupRoom', async (contactID: string) => {
		// Joining to the group sockets
		emitArray.forEach(emitString => socket.removeAllListeners(emitString));
		const IDs = [userID, contactID, contactID];

		chatSockets(socket, IDs, TypeContact.GROUP, socket.user.username);
		memberSockets(socket, IDs, socket.user);
		modSockets(socket, contactID, socket.user);
		adminSockets(socket, IDs);
	});

	genericSockets(socket, userID, socket.user);

	socket.on('disconnect', async () => {
		console.log(socket.id, '==== disconnected');
		// Disconnecting user
		await User.updateOne({ _id: userID }, { logged: false });

		// Disconnecting user from the group
		await Group.updateMany(
			{ _id: socket.user.groupRooms },
			{ $pull: { loggedUsers: userID } }
		);

		socket.to(socket.user.userRooms).emit('loggedUser', userID, false);
		socket.to(socket.user.groupRooms).emit('countMembers', userID, -1);
		socket.removeAllListeners();
	});
};
