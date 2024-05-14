import type { Socket } from 'socket.io';
import type { IKeys } from './types/types.js';
import { ErrorMessage } from './dictionary.js';
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
		'emitChat', 'emitFindChat', 'emitDelete', 'emitLeave', 'emitBlock', 'emitDestroy', 'emitBlockDestroy', 'emitLeaveGroup', 'emitBlockGroup', 'emitAddMember', 'emitBanMember', 'emitBlockMember', 'emitUnblockMember', 'emitAddMod', 'emitRemoveMod', 'emitChangeAvatar', 'emitChangeDescription', 'emitChangeState', 'emitDestroyGroup'
	];
	const userID = socket.user.id;
	socket.user.logged = true;

	if (socket.user.socketIds.length) {
		const socketIds = socket.user.socketIds;

		socket.to(socketIds).timeout(1000).emit('checkId', async (err: unknown, socketsID: string[]) => {
			const replaceIds: string[] = [];

			if (!err) {
				for (const id of socketsID) {
					if (typeof id === 'string' && socketIds.includes(id)) {
						replaceIds.push(id);
					}
				}
			}

			if (replaceIds.length === 0 || socketIds.length > replaceIds.length) {
				await User
					.updateOne(
						{ _id: userID },
						{ socketIds: [...replaceIds, socket.id] })
					.catch(() => console.error('Database Error'));
			}
		});
	}

	try {
		// Connecting user
		await User.updateOne(
			{ _id: userID },
			{
				logged: true,
				tempId: socket.user.tempId,
				$addToSet: { socketIds: socket.id }
			});

		// Connecting user to the group
		await Group.updateMany(
			{ _id: socket.user.groupRooms },
			{ $addToSet: { loggedUsers: userID } });
	} catch {
		socket.emit('socketError', ErrorMessage.failureDatabase);
	}

	socket.join([
		socket.user.tempId, ...socket.user.userRooms, ...socket.user.groupRooms]);
	socket.to(socket.user.userRooms).emit('loggedUser', userID, true);
	socket.to(socket.user.groupRooms).emit('countUser', userID);
	
	socket.use(async ([event, ...args], next) => {
		console.log(event, args);
		const selectedFunction = socketIndex[event];
		let match: IKeys<string> | boolean = ErrorMessage.socketError;

		if (typeof event === 'string' && selectedFunction !== undefined) {
			// Check if the event and arguments are valid
			try {
				match = await selectedFunction(args as never, socket.user);
			} catch (err) {
				console.error(err);
				match = ErrorMessage.failureDatabase;
			}

			if (match === true) return next();
		}
		
		socket.emit('socketError', match);
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
		modSockets(socket, contactID);
		adminSockets(socket, IDs);
	});

	socket.on('removeListeners', () => {
		emitArray.forEach(emitString => socket.removeAllListeners(emitString));
	});

	genericSockets(socket, userID, socket.user);

	socket.on('disconnect', async () => {
		console.log(socket.id, '==== disconnected');

		const user = await User
			.findOneAndUpdate({ _id: userID }, { $pull: { socketIds: socket.id } })
			.catch(() => null);

		if (user && user.socketIds.length <= 1) {
			try {
				// Disconnecting user
				await User.updateOne({ _id: userID }, { logged: false, tempId: '' });
	
				// Disconnecting user from the group
				await Group.updateMany(
					{ _id: socket.user.groupRooms },
					{ $pull: { loggedUsers: userID } });
			} catch  {
				console.log('An error occurred while trying update the user or the group');
			}

			socket.to(socket.user.userRooms).emit('loggedUser', userID, false);
			socket.to(socket.user.groupRooms).emit('discountUser', userID);
		}

		socket.removeAllListeners();
	});
};
