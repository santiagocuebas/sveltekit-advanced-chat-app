import type { Socket } from 'socket.io';
import { getChats, getUserContacts, getGroupContacts } from './libs/index.js';
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
	const { username } = socket.user;
	let { users, userRooms, groupRooms, blacklist } = socket.user;

	await User.updateOne({ _id: userID }, { logged: true, tempId: socket.id });

	const [contacts, removedUsers] = await getUserContacts(userID, users);
	const [groups, removedGroups] = await getGroupContacts(userID, groupRooms);

	if (removedUsers.length) {
		userRooms = userRooms.filter(room => removedUsers.includes(room));
	}

	if (removedGroups.length) {
		groupRooms = groupRooms.filter(room => removedGroups.includes(room));
	}

	socket.join([...userRooms, ...groupRooms]);
	socket.emit('loadContacts', [contacts, groups]);
	socket.to(userRooms).emit('loggedUser', userID, true);
	socket.to(groupRooms).emit('countMembers', userID, 1);
	
	socket.use(async ([event, ...args], next) => {
		console.log(event, args);
		if (typeof event === 'string' && socketIndex[event] !== undefined) {
			const match = await socketIndex[event](args as never, socket.user);

			if (match === true) return next();

			socket.emit('socketError', match);
		} else {
			socket.emit('invalidEvent');
		}
	});

	socket.on('joinUserRoom', async (contactID: string, roomID: string) => {
		emitArray.forEach(emitString => socket.removeAllListeners(emitString));

		const IDs = [userID, contactID, roomID];
		const messages = await getChats(IDs);

		socket.emit('loadChats', messages);

		chatSockets(socket, IDs);

		[userRooms, blacklist] = userSockets(socket, IDs, users, userRooms, blacklist);
	});

	socket.on('joinGroupRoom', async (contactID: string) => {
		emitArray.forEach(emitString => socket.removeAllListeners(emitString));
		const IDs = [userID, contactID, contactID];

		const messages = await getChats(IDs, TypeContact.GROUP);

		socket.emit('loadChats', messages);

		chatSockets(socket, IDs, username);

		[groupRooms, blacklist] = memberSockets(socket, IDs, groupRooms, blacklist);

		modSockets(socket, IDs);

		groupRooms = adminSockets(socket, IDs, groupRooms);
	});

	socket.on('joinUpdate', (id: string) => {
		if (!userRooms.includes(id) || !groupRooms.includes(id)) {
			socket.join(id);
		}
	});

	socket.on('removeRoom', (roomID: string) => {
		if (userRooms.includes(roomID) || groupRooms.includes(roomID)) {
			socket.leave(roomID);
		}
	});

	[users, groupRooms] = genericSockets(socket, userID, username, users, groupRooms);

	socket.on('emitDestroyUser', () => {
		socket.to(userRooms).emit('leaveUser', userID);
		socket.to(groupRooms).emit('updateMember', userID);
	});

	socket.on('disconnect', async () => {
		console.log(socket.id, '==== disconnected');
		await User.updateOne({ _id: userID }, { logged: false, tempId: undefined });

		for (const _id of groupRooms) {
			await Group.updateOne({ _id }, { $pull: { connectedUsers: userID } });
		}

		socket.to(userRooms).emit('loggedUser', userID, false);
		socket.to(groupRooms).emit('countMembers', userID, -1);
		socket.removeAllListeners();
	});
};
