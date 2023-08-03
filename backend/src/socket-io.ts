import type { Socket } from 'socket.io';
import type { GroupInit } from './types/types.js';
import type { IGroup, IUser, Members } from './types/global.js';
import {
	getChats,
	updateUser,
	getUserContacts,
	getGroupContacts,
	getContact
} from './libs/index.js';
import { User, Chat, Group } from './models/index.js';
import { TypeContact } from './types/enums.js';

export default async (socket: Socket) => {
	const emitArray = [
		'emitChat', 'emitDelete', 'emitLeave', 'emitBlock', 'emitDestroy', 'emitBlockDestroy', 'emitLeaveGroup', 'emitBlockGroup', 'emitAddMember', 'emitBanMember', 'emitBlockMember', 'emitUnblockMember', 'emitAddMod', 'emitRemoveMod', 'emitChangeState', 'emitDestroyGroup'
	];
	const userID = socket.user.id;
	const { username, users, blacklist } = socket.user;
	let { userRooms, groupRooms } = socket.user;

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
	socket.to([...userRooms]).emit('loggedUser', userID, true);
	socket.to([...groupRooms]).emit('countMembers', userID, 1);

	socket.on('joinRoom', async ([contactID, roomID]: string[]) => {
		emitArray.forEach(emitString => socket.removeAllListeners(emitString));

		const messages = await getChats(userID, contactID, roomID);

		socket.emit('loadChats', messages);

		socket.on('emitChat', async (message: string) => {
			const chat = await Chat.create({
				from: userID,
				to: contactID,
				username: roomID.length <= 24 ? username : undefined,
				content: message,
				createdAt: new Date
			});
	
			socket.to(roomID).emit('loadChat', chat);
			socket.to(roomID).emit('editContacts', roomID, chat.content, chat.createdAt);
		});

		socket.on('emitDelete', async (id: string) => {
			await Chat.deleteOne({ _id: id, from: userID });

			socket.to(roomID).emit('deleteChat', id);
		});

		socket.on('emitLeave', async () => {
			const user = await User.findOne({ _id: contactID }, 'users') as IUser;

			await updateUser(userID, contactID, users);
			await updateUser(contactID, userID, user.users);

			userRooms = userRooms.filter(id => id !== roomID);
	
			socket.to(roomID).emit('leaveUser', userID);
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
			
			socket.to(roomID).emit('leaveUser', userID);
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
			
			socket.to(roomID).emit('leaveUser', userID);
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
			
			socket.to(roomID).emit('leaveUser', userID);
			socket.leave(roomID);
		});

		socket.on('emitLeaveGroup', async (userID: string) => {
			await Group.updateOne(
				{ _id: contactID },
				{
					$pull: {
						connectedUsers: userID,
						mods: { id: userID },
						members: { id: userID }
					}
				}
			);
	
			await User.updateOne({ _id: userID }, { $pull: { groupRooms: contactID } });
	
			groupRooms = groupRooms.filter(id => id !== contactID);
			
			socket.to(contactID).emit('leaveGroup', userID);
			socket.leave(contactID);
		});
	
		socket.on('emitBlockGroup', async ([userID, name]: string[]) => {
			blacklist.push({
				id: contactID,
				name,
				type: TypeContact.GROUP
			});

			await Group.updateOne(
				{ _id: contactID },
				{
					$pull: {
						connectedUsers: userID,
						mods: { id: userID },
						members: { id: userID }
					}
				}
			);
	
			await User.updateOne(
				{ _id: userID },
				{
					blacklist,
					$pull: { groupRooms: contactID }
				}
			);
	
			groupRooms = groupRooms.filter(id => id !== contactID);
			
			socket.to(contactID).emit('leaveGroup', userID);
			socket.leave(contactID);
		});
	
		socket.on('emitAddMember', async (members: Members[]) => {
			await Group.updateOne({ _id: contactID }, { $push: { members } });
	
			for (const { id } of members) {
				await User.updateOne({ _id: id }, { $push: { groupRooms: [contactID] } });
			}
			
			socket.to(contactID).emit('updateMember', userID);
		});
	
		socket.on('emitBanMember', async (userIDs: string[]) => {
			await Group.updateOne(
				{ _id: contactID },
				{
					$pull: {
						connectedUsers: { $in: userIDs },
						members: { id: { $in: userIDs } },
						mods: { id: { $in: userIDs } }
					}
				}
			);
	
			for (const id of userIDs) {
				await User.updateOne({ _id: id }, { $pull: { groupRooms: contactID } });
			}
			
			socket.to(contactID).emit('updateMember', userID);
		});
	
		socket.on('emitBlockMember', async (members: Members[]) => {
			const userIDs = members.map(member => member.id);

			await Group.updateOne(
				{ _id: contactID },
				{
					$push: { blacklist: members },
					$pull: {
						connectedUsers: { $in: userIDs },
						members: { id: { $in: userIDs } },
						mods: { id: { $in: userIDs } }
					}
				}
			);

			for (const { id } of members) {
				await User.updateOne({ _id: id }, { $pull: { groupRooms: contactID } });
			}
			
			socket.to(contactID).emit('updateMember', userID);
		});
	
		socket.on('emitUnblockMember', async (userIDs: string[]) => {
			await Group.updateOne(
				{ _id: contactID },
				{ $pull: { blacklist: { id: { $in: userIDs } } } }
			);
		});
	
		socket.on('emitAddMod', async (mods: Members[]) => {
			const userIDs = mods.map(mods => mods.id);

			await Group.updateOne(
				{ _id: contactID },
				{
					$push: { mods },
					$pull: { members: { id: { $in: userIDs } } }
				}
			);
			
			socket.to(contactID).emit('modChange', userID);
		});
	
		socket.on('emitRemoveMod', async (members: Members[]) => {
			const userIDs = members.map(member => member.id);

			await Group.updateOne(
				{ _id: contactID },
				{
					$push: { members },
					$pull: { mods: { id: { $in: userIDs } } }
				}
			);
			
			socket.to(contactID).emit('modChange', userID);
		});
	
		socket.on('emitChangeState', async (state: string) => {
			await Group.updateOne({ _id: contactID }, { state });
		});
	
		socket.on('emitDestroyGroup', async () => {
			const { admin, mods, members } = await Group
				.findOneAndDelete({ _id: contactID })
				.select('admin mods members') as IGroup;
				
			const contactsIDs = [...mods, ...members].map(user => user.id);
	
			[admin, ...contactsIDs].forEach(async id => {
				await User.updateOne({ _id: id }, { $pull: { groupRooms: contactID } });
			});
	
			await Chat.deleteMany({ to: contactID });
	
			groupRooms = groupRooms.filter(id => id !== contactID);
			
			socket.to(contactID).emit('leaveGroup', contactID);
			socket.leave(contactID);
		});
	});

	socket.on('joinUpdate', (id: string) => {
		if (!userRooms.includes(id) || !groupRooms.includes(id)) {
			socket.join(id);
		}
	});

	socket.on('joinUser', async (id: string) => {
		const roomID = id + userID;
		users.push({ userID: id, roomID });

		const user = await User
			.findOneAndUpdate(
				{ _id: id },
				{ $push: { users: { userID, roomID } } }
			)
			.select('username avatar users logged tempId') as IUser;
		
		await User.updateOne({ _id: userID }, { users });

		const chat = await Chat
			.findOne({ from: id, to: userID })
			.sort({ createdAt: -1 });

		const chatUser = await Chat
			.findOne({ from: userID, to: id })
			.sort({ createdAt: -1 });

		const contact = getContact(id, roomID, user, TypeContact.USER, chat);
		const userContact = getContact(userID, roomID, socket.user, TypeContact.USER, chatUser);
	
		if (user.tempId) {
			socket.to(user.tempId).emit('updateContacts', userContact);
			socket.to(user.tempId).emit('loggedUser', userID, true);
		}

		socket.emit('updateContacts', contact);
		socket.join(roomID);
	});

	socket.on('joinGroup', async (id: string) => {
		const group = await Group.findOneAndUpdate(
			{ _id: id },
			{ $push: { members: { id: userID, name: username } } }
		) as IGroup;

		groupRooms.push(id);

		await User.updateOne({ _id: userID }, { groupRooms });

		const chat = await Chat
			.findOne({ to: id })
			.sort({ createdAt: -1 });

		const contact = getContact(id, id, group, TypeContact.GROUP, chat);

		socket.emit('updateContacts', contact);
		socket.to(id).emit('countMembers', userID, 1);
		socket.join(id);
	});

	socket.on('createGroup', async ({ name, mods, members, state }: GroupInit) => {
		const group = await Group.create({
			admin: userID,
			mods,
			members,
			name,
			state,
			loggedUser: [userID]
		});

		const groupID = String(group._id);
		groupRooms.push(groupID);

		await User.updateOne({ _id: userID }, { groupRooms });

		const contact = getContact(groupID, groupID, group, TypeContact.GROUP);

		[...mods, ...members].forEach(async ({ id }) => {
			await User.updateOne({ _id: id }, { $push: { groupRooms: [groupID] } });
		});

		const contactsIDs = [...mods, ...members].map(user => user.id);

		const rooms = users.map(({ userID, roomID }) => {
			if (contactsIDs.includes(userID)) return roomID;

			return '';
		});

		socket.join(groupID);
		socket.emit('updateContacts', contact);
		socket.to(rooms).emit('updateContacts', contact);
	});

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

		socket.to([...userRooms]).emit('loggedUser', userID, false);
		socket.to([...groupRooms]).emit('countMembers', userID, -1);
		socket.removeAllListeners();
	});
};
