import type { IGroup, Member } from '../types/global.js';
import type { ModSockets } from '../types/sockets.js';
import { getContact } from '../libs/get-data.js';
import { User, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const modSockets: ModSockets = (socket, contactID) => {
	socket.on('emitAddMember', async (members: Member[]) => {
		const userIDs = members.map(({ id }) => id);
		const memberIDs: string[] = [];
		const loggedUsers: string[] = [];

		// Add group id to the users
		await User.updateMany({ _id: userIDs }, { $push: { groupRooms: contactID } });

		const users = await User
			.find({ _id: userIDs })
			.lean({ virtuals: true });

		for (const { id, tempId, logged } of users) {
			if (logged) {
				memberIDs.push(tempId);
				loggedUsers.push(id);
			}
		}

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
		
		// Find chats
		const contact = await getContact(contactID, group, TypeContact.GROUP);

		socket.emit('countMembers', contactID, memberIDs.length);
		socket.to(contactID).emit('addMembers', contactID, ...members);
		socket.to(contactID).emit('countMembers', contactID, memberIDs.length);
		socket.to(memberIDs).emit('updateContacts', contact, true);
	});

	socket.on('emitBanMember', async (userIDs: string[]) => {
		const memberIDs: string[] = [];

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

		const users = await User.find({ _id: userIDs });

		for (const { tempId, logged } of users) {
			if (logged) memberIDs.push(tempId);
		}
		
		socket.emit('countMembers', contactID, -memberIDs.length);
		socket.to(contactID).emit('banMembers', contactID, ...userIDs);
		socket.to(contactID).emit('countMembers', contactID, -memberIDs.length);
		socket.to(memberIDs).emit('leaveGroup', contactID);
	});

	socket.on('emitBlockMember', async (members: Member[]) => {
		const userIDs = members.map(member => member.id);
		const memberIDs: string[] = [];

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

		const users = await User.find({ _id: userIDs });

		for (const { tempId, logged } of users) {
			if (logged) memberIDs.push(tempId);
		}
		
		socket.emit('countMembers', contactID, -memberIDs.length);
		socket.to(contactID).emit('blockMembers', contactID, ...members);
		socket.to(contactID).emit('countMembers', contactID, -memberIDs.length);
		socket.to(memberIDs).emit('leaveGroup', contactID);
	});

	socket.on('emitUnblockMember', async (userIDs: string[]) => {
		// Unblock contacts to the group
		await Group.updateOne(
			{ _id: contactID },
			{ $pull: { blacklist: { id: { $in: userIDs } } } }
		);
		
		socket.to(contactID).emit('unblockMembers', contactID, ...userIDs);
	});
};
