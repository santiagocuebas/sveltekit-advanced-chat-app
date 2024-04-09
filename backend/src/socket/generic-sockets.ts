import type { IGroup, IUser } from '../types/global.js';
import type { GenericSockets } from '../types/sockets.js';
import type { GroupInit, IContact, IKeys } from '../types/types.js';
import { getContact } from '../libs/index.js';
import { User, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const genericSockets: GenericSockets = (socket, userID, user) => {
	socket.on('joinUser', async (id: string) => {
		const roomID = id + userID;
		user.users.push({ userID: id, roomID });
		user.userIDs.push(id);
		user.userRooms.push(roomID);

		// Add user id
		const foreignUser = await User
			.findOneAndUpdate({ _id: id }, { $push: { users: { userID, roomID } } })
			.select('_id username avatar users logged tempId')
			.lean({ virtuals: true }) as IUser;
		
		// Add contact id
		await User.updateOne({ _id: userID }, { users: user.users });

		// Find chats
		const contact = await getContact(roomID, foreignUser, TypeContact.USER, userID);
	
		if (foreignUser.logged) {
			const contact = await getContact(roomID, user, TypeContact.USER, id);
			socket.to(foreignUser.tempId).emit('updateContacts', contact, true);
		}

		socket.emit('updateContacts', contact);
		socket.join(roomID);
	});

	socket.on('joinGroup', async (id: string) => {
		user.groupRooms.push(id);
		const member = { id: userID, name: user.username };
		
		// Add contact id
		const group = await Group
			.findOneAndUpdate(
				{ _id: id },
				{ $push: { members: member, loggedUsers: [userID] } }
			)
			.lean({ virtuals: true }) as IGroup;

		group.members.push(member);
		
		// Add group id
		await User.updateOne({ _id: userID }, { groupRooms: user.groupRooms });

		// Find chats
		const contact = await getContact(id, group, TypeContact.GROUP);
		if (typeof contact.logged !== 'boolean') contact.logged.push(userID);

		socket.emit('updateContacts', contact);
		socket.to(id).emit('addMembers', id, [member], [userID]);
		socket.join(id);
	});

	socket.on('createGroup', async ({ name, mods, members, state }: GroupInit) => {
		const contactsIDs = [...mods, ...members].map(user => user.id);
		
		const users = contactsIDs.length
			? await User.find({ id: contactsIDs, logged: true })
			: [];
		
		contactsIDs.push(userID);
		
		// Create a new group
		const group = await Group.create({
			admin: userID,
			mods,
			members,
			name,
			state,
			loggedUsers: [userID, ...users.map(user => user.id)]
		});

		const groupID = String(group._id);
		user.groupRooms.push(groupID);

		if (user.blockedGroupsIDs.includes(groupID)) {
			user.blockedGroups = user.blockedGroups.filter(group => group.id !== groupID);
			user.blockedGroupsIDs = user.blockedGroupsIDs.filter(id => id !== groupID);
		}

		// Add group id
		await User.updateMany(
			{ _id: contactsIDs },
			{
				$push: { groupRooms: groupID },
				$pull: { blockedGroups: { id: groupID } }
			}
		);

		const contact = await getContact(groupID, group.toJSON(), TypeContact.GROUP);

		socket.join(groupID);
		socket.emit('updateContacts', contact);
		
		if (users.length) {
			socket.to(users.map(user => user.tempId)).emit('updateContacts', contact, true);
		}
	});

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
	
	socket.on('emitDestroyUser', () => {
		socket.to(socket.user.userRooms).emit('leaveUser', userID);
		socket.to(socket.user.groupRooms).emit('destroyUser', userID);
	});
};
