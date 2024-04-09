import type { IGroup, Member } from '../types/global.js';
import type { ModSockets } from '../types/sockets.js';
import { getContact } from '../libs/get-data.js';
import { User, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const modSockets: ModSockets = (socket, contactID) => {
	socket.on('emitAddMember', async (members: Member[]) => {
		const userIDs = members.map(({ id }) => id);

		// Add group id to the users
		await User.updateMany({ _id: userIDs }, { $push: { groupRooms: contactID } });

		const users = await User
			.find({ _id: userIDs, logged: true })
			.lean({ virtuals: true });

		const loggedUsers = users.map(user => user.id);

		// Add contacts to the group
		const group = await Group.findOneAndUpdate(
			{ _id: contactID },
			{
				$push: {
					members: { $each: members },
					loggedUsers: { $each: loggedUsers }
				}
			}
		) as IGroup;

		group.members = [...members, ...group.members];

		socket.emit('countMembers', contactID, loggedUsers);
		socket.to(contactID).emit('addMembers', contactID, members, loggedUsers);

		if (users.length) {
			// Find chats
			const contact = await getContact(contactID, group, TypeContact.GROUP);
			if (typeof contact.logged !== 'boolean') {
				contact.logged = [...loggedUsers, ...group.logged];
			}
			
			socket.to(users.map(user => user.tempId)).emit('updateContacts', contact, true);
		}
	});

	socket.on('emitBanMember', async (userIDs: string[]) => {
		// Remove contacts to the group
		await Group.updateOne(
			{ _id: contactID },
			{
				$pull: {
					loggedUsers: { $in: userIDs },
					members: { id: { $in: userIDs } },
					mods: { id: { $in: userIDs } }
				}
			}
		);

		// Remove group id from the users
		await User.updateMany({ _id: userIDs }, { $pull: { groupRooms: contactID } });

		const users = await User.find({ _id: userIDs, logged: true });
		const loggedUsers = users.map(user => user.id);
		
		socket.emit('discountMembers', contactID, loggedUsers);
		socket.to(contactID).emit('banMembers', contactID, userIDs, loggedUsers);

		if (users.length) {
			socket.to(users.map(user => user.tempId)).emit('leaveGroup', contactID);
		}
	});

	socket.on('emitBlockMember', async (members: Member[]) => {
		const userIDs = members.map(member => member.id);

		// Remove and block contacts to the group
		await Group.updateOne(
			{ _id: contactID },
			{
				$push: { blacklist: { $each: members } },
				$pull: {
					loggedUsers: { $in: userIDs },
					members: { id: { $in: userIDs } },
					mods: { id: { $in: userIDs } }
				}
			}
		);

		// Remove group id from the users
		await User.updateMany({ _id: userIDs }, { $pull: { groupRooms: contactID } });

		const users = await User.find({ _id: userIDs, logged: true });
		const loggedUsers = users.map(user => user.id);
		
		socket.emit('discountMembers', contactID, loggedUsers);
		socket.to(contactID).emit('blockMembers', contactID, members, loggedUsers);
		
		if (users.length) {
			socket.to(users.map(user => user.tempId)).emit('leaveGroup', contactID);
		}
	});

	socket.on('emitUnblockMember', async (userIDs: string[]) => {
		// Unblock contacts to the group
		await Group.updateOne(
			{ _id: contactID },
			{ $pull: { blacklist: { id: { $in: userIDs } } } }
		);
		
		socket.to(contactID).emit('unblockMembers', contactID, userIDs);
	});
};
