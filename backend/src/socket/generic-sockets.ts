import type { IGroup, IUser } from '../types/global.js';
import type { GenericSockets } from '../types/sockets.js';
import type { GroupInit, IContact, IKeys } from '../types/types.js';
import { getContact } from '../libs/index.js';
import { User, Group, Chat } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const genericSockets: GenericSockets = (socket, userID, user) => {
	socket.on('emitUnblock', ({ users, groups }: IKeys<string[]>) => {
		user.blockedUsers = user.blockedUsers.filter(({ id }) => !users.includes(id));
		user.blockedUsersIDs = user.blockedUsersIDs.filter(id => !users.includes(id));
		user.blockedGroups = user.blockedGroups.filter(({ id }) => !groups.includes(id));
		user.blockedGroupsIDs = user.blockedGroupsIDs.filter(id => !groups.includes(id));
	});

	socket.on('joinUpdate', ({ contactID, roomID, type }: IContact) => {
		if (type === TypeContact.USER) {
			user.users.push({ userID: contactID, roomID });
			user.userIDs.push(contactID);
			user.userRooms.push(roomID);
		} else user.groupRooms.push(roomID);

		socket.join(roomID);
	});

	socket.on('removeRoom', (roomID: string, type: TypeContact) => {
		if (type === TypeContact.USER) {
			const leaveRoom = user.users.find(user => user.roomID === roomID);
			user.users = user.users.filter(user => user.roomID !== roomID);
			user.userIDs = user.userIDs.filter(id => id !== leaveRoom?.userID);
			user.userRooms = user.userRooms.filter(id => id !== roomID);
		} else user.groupRooms = user.groupRooms.filter(id => id !== roomID);

		socket.leave(roomID);
	});
	
	socket.on('joinUser', async (id: string) => {
		const roomID = id + userID;
		user.users.push({ userID: id, roomID });
		user.userIDs.push(id);
		user.userRooms.push(roomID);

		// Add user id
		const foreignUser = await User
			.findOneAndUpdate({ _id: id }, { $push: { users: { userID, roomID } } })
			.select('username avatar users logged tempId') as IUser;
		
		// Add contact id
		await User.updateOne({ _id: userID }, { users: user.users });

		// Find chats
		const chat = await Chat
			.findOne({ from: id, to: userID })
			.sort({ createdAt: -1 });

		const chatUser = await Chat
			.findOne({ from: userID, to: id })
			.sort({ createdAt: -1 });

		const contact = getContact(id, roomID, foreignUser, TypeContact.USER, chat);
		const userContact = getContact(userID, roomID, user, TypeContact.USER, chatUser);
	
		if (foreignUser.logged) {
			socket.to(foreignUser.tempId).emit('updateContacts', userContact, true);
			socket.to(foreignUser.tempId).emit('loggedUser', userID, true);
		}

		socket.emit('updateContacts', contact);
		socket.join(roomID);
	});

	socket.on('joinGroup', async (id: string) => {
		user.groupRooms.push(id);
		
		// Add contact id
		const group = await Group.findOneAndUpdate(
			{ _id: id },
			{ $push: { members: { id: userID, name: user.username } } }
		) as IGroup;
		
		// Add group id
		await User.updateOne({ _id: userID }, { groupRooms: user.groupRooms });

		// Find chats
		const chat = await Chat
			.findOne({ to: id })
			.sort({ createdAt: -1 });

		const contact = getContact(id, id, group, TypeContact.GROUP, chat);

		socket.emit('updateContacts', contact);
		socket.to(id).emit('countMembers', userID, 1);
		socket.join(id);
	});

	socket.on('createGroup', async ({ name, mods, members, state }: GroupInit) => {
		// Create a new group
		const group = await Group.create({
			admin: userID,
			mods,
			members,
			name,
			state,
			loggedUser: [userID]
		});

		const groupID = String(group._id);
		user.groupRooms.push(groupID);

		if (user.blockedGroupsIDs.includes(groupID)) {
			user.blockedGroups = user.blockedGroups.filter(group => group.id !== groupID);
			user.blockedGroupsIDs = user.blockedGroupsIDs.filter(groupID => groupID !== groupID);
		}

		// Add group id
		await User.updateOne(
			{ _id: userID },
			{ groupRooms: user.groupRooms, blockedGroups: user.blockedGroups }
		);

		const contact = getContact(groupID, groupID, group, TypeContact.GROUP);

		[...mods, ...members].forEach(async ({ id }) => {
			await User.updateOne(
				{ _id: id },
				{
					$push: { groupRooms: [groupID] },
					$pull: { blockedGroups: { id: groupID } }
				}
			);
		});

		// Get roomIDs
		const contactsIDs = [...mods, ...members].map(user => user.id);
		const roomIDs: string[] = [];

		for (const { userID, roomID } of user.users) {
			if (contactsIDs.includes(userID)) roomIDs.push(roomID);
		}

		socket.join(groupID);
		socket.emit('updateContacts', contact);
		socket.to(roomIDs).emit('updateContacts', contact, true);
	});

	socket.on('emitDestroyUser', () => {
		socket.to(socket.user.userRooms).emit('leaveUser', userID);
		socket.to(socket.user.groupRooms).emit('destroyUser', userID);
	});
};
