import type { IGroup, IUser } from '../types/global.js';
import type { GenericSockets } from '../types/sockets.js';
import type { GroupInit } from '../types/types.js';
import { getContact } from '../libs/index.js';
import { User, Group, Chat } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const genericSockets: GenericSockets = (socket, userID, user) => {
	socket.on('joinUser', async (id: string) => {
		const roomID = id + userID;
		user.users.push({ userID: id, roomID });
		user.userIDs.push(id);
		user.userRooms.push(roomID);

		const foreignUser = await User
			.findOneAndUpdate(
				{ _id: id },
				{ $push: { users: { userID, roomID } } }
			)
			.select('username avatar users logged tempId') as IUser;
		
		await User.updateOne({ _id: userID }, { users: user.users });

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
		
		const group = await Group.findOneAndUpdate(
			{ _id: id },
			{
				$push: { members: { id: userID, name: user.username } },
				$pull: { blockUsers: userID }
			}
		) as IGroup;

		await User.updateOne({ _id: userID }, { groupRooms: user.groupRooms });

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
		user.groupRooms.push(groupID);

		if (user.blockedGroupsIDs.includes(groupID)) {
			user.blockedGroups = user.blockedGroups.filter(group => group.id !== groupID);
			user.blockedGroupsIDs = user.blockedGroupsIDs.filter(groupID => groupID !== groupID);
		}

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

		const contactsIDs = [...mods, ...members].map(user => user.id);
		const roomIDs: string[] = [];

		for (const { userID, roomID } of user.users) {
			if (contactsIDs.includes(userID)) roomIDs.push(roomID);
		}

		socket.join(groupID);
		socket.emit('updateContacts', contact);
		socket.to(roomIDs).emit('updateContacts', contact, true);
	});
};
