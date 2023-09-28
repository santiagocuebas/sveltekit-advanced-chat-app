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
import { TypeContact } from './types/enums.js';
import { socketIndex } from './validations/socket-index.js';
import { IContact, IKeys } from './types/types.js';

export default async (socket: Socket) => {
	console.log(socket.id, '==== connected');

	const emitArray = [
		'emitChat', 'emitDelete', 'emitLeave', 'emitBlock', 'emitDestroy', 'emitBlockDestroy', 'emitLeaveGroup', 'emitBlockGroup', 'emitAddMember', 'emitBanMember', 'emitBlockMember', 'emitUnblockMember', 'emitAddMod', 'emitRemoveMod', 'emitChangeAvatar', 'emitChangeDescription', 'emitChangeState', 'emitDestroyGroup'
	];
	const userID = socket.user.id;

	await User.updateOne({ _id: userID }, { logged: true, tempId: socket.id });

	const [contacts, removedUsers] = await getUserContacts(userID, socket.user.users);
	const [groups, removedGroups] = await getGroupContacts(userID, socket.user.groupRooms);

	if (removedUsers.length) {
		socket.user.userRooms = socket.user.userRooms.filter(room => !removedUsers.includes(room));
	}

	if (removedGroups.length) {
		socket.user.groupRooms = socket.user.groupRooms.filter(room => !removedGroups.includes(room));
	}

	socket.join([...socket.user.userRooms, ...socket.user.groupRooms]);
	socket.emit('loadContacts', [contacts, groups]);
	socket.to(socket.user.userRooms).emit('loggedUser', userID, true);
	socket.to(socket.user.groupRooms).emit('countMembers', userID, 1);
	
	socket.use(async ([event, ...args], next) => {
		console.log(event, args);

		if (typeof event === 'string' && socketIndex[event] !== undefined) {
			const match = await socketIndex[event](args as never, socket.user);

			if (match === true) return next();

			socket.emit('socketError', match);
		} else {
			socket.emit('socketError', { error: 'Socket Error', message: 'The socket emitted no exist' });
		}
	});

	socket.on('joinUserRoom', async (contactID: string, roomID: string) => {
		emitArray.forEach(emitString => socket.removeAllListeners(emitString));
		const IDs = [userID, contactID, roomID];
		const messages = await getChats(IDs);

		socket.emit('loadChats', messages);

		chatSockets(socket, IDs);

		userSockets(socket, IDs, socket.user);
	});

	socket.on('joinGroupRoom', async (contactID: string) => {
		emitArray.forEach(emitString => socket.removeAllListeners(emitString));
		const IDs = [userID, contactID, contactID];
		const messages = await getChats(IDs, TypeContact.GROUP);

		socket.emit('loadChats', messages);

		chatSockets(socket, IDs, socket.user.username);

		memberSockets(socket, IDs, socket.user);

		modSockets(socket, contactID);

		adminSockets(socket, IDs);
	});
	
	socket.on('emitUnblock', ({ users, groups }: IKeys<string[]>) => {
		socket.user.blockedUsers = socket.user.blockedUsers.filter(({ id }) => !users.includes(id));
		socket.user.blockedUsersIDs = socket.user.blockedUsersIDs.filter(id => !users.includes(id));
		socket.user.blockedGroups = socket.user.blockedGroups.filter(({ id }) => !groups.includes(id));
		socket.user.blockedGroupsIDs = socket.user.blockedGroupsIDs.filter(id => !groups.includes(id));
	});

	socket.on('joinUpdate', ({ contactID, roomID, type }: IContact) => {
		if (type === TypeContact.USER) {
			socket.user.users.push({ userID: contactID, roomID });
			socket.user.userIDs.push(contactID);
			socket.user.userRooms.push(roomID);
		} else socket.user.groupRooms.push(roomID);

		socket.join(roomID);
	});

	socket.on('removeRoom', (roomID: string, type: TypeContact) => {
		if (type === TypeContact.USER) {
			const leaveRoom = socket.user.users.filter(user => user.roomID === roomID);
			socket.user.users = socket.user.users.filter(user => user.roomID !== roomID);
			socket.user.userIDs = socket.user.userIDs.filter(id => id !== leaveRoom[0].userID);
			socket.user.userRooms = socket.user.userRooms.filter(id => id !== roomID);
		} else {
			socket.user.groupRooms = socket.user.groupRooms.filter(id => id !== roomID);
		}

		socket.leave(roomID);
	});

	genericSockets(socket, userID, socket.user);

	socket.on('emitDestroyUser', () => {
		socket.to(socket.user.userRooms).emit('leaveUser', userID);
		socket.to(socket.user.groupRooms).emit('destroyUser', userID);
	});

	socket.on('disconnect', async () => {
		console.log(socket.id, '==== disconnected');
		await User.updateOne({ _id: userID }, { logged: false });

		for (const _id of socket.user.groupRooms) {
			await Group.updateOne({ _id }, { $pull: { connectedUsers: userID } });
		}

		socket.to(socket.user.userRooms).emit('loggedUser', userID, false);
		socket.to(socket.user.groupRooms).emit('countMembers', userID, -1);
		socket.removeAllListeners();
	});
};
