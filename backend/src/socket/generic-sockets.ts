import type { IGroup, IUser } from '../types/global.js';
import type { GenericSockets } from '../types/sockets.js';
import type { GroupInit } from '../types/types.js';
import { getContact } from '../libs/index.js';
import { User, Group, Chat } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const genericSockets: GenericSockets = (socket, userID, username, users, groupRooms) => {
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

	return [users, groupRooms];
};
