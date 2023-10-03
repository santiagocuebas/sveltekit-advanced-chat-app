import type { Member } from '../types/global.js';
import type { ModSockets } from '../types/sockets.js';
import { User, Group } from '../models/index.js';

export const modSockets: ModSockets = (socket, contactID) => {
	socket.on('emitAddMember', async (members: Member[]) => {
		// Add contacts to the group
		await Group.updateOne(
			{ _id: contactID },
			{ $push: { members: { $each: members } } }
		);

		// Add group id to the users
		for (const { id } of members) {
			await User.updateOne({ _id: id }, { $push: { groupRooms: [contactID] } });
		}
		
		socket.to(contactID).emit('addMembers', contactID, members);
	});

	socket.on('emitBanMember', async (userIDs: string[]) => {
		// Remove contacts to the group
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

		// Remove group id from the users
		for (const id of userIDs) {
			await User.updateOne({ _id: id }, { $pull: { groupRooms: contactID } });
		}
		
		socket.to(contactID).emit('banMembers', contactID, userIDs);
	});

	socket.on('emitBlockMember', async (members: Member[]) => {
		const userIDs = members.map(member => member.id);

		// Remove and block contacts to the group
		await Group.updateOne(
			{ _id: contactID },
			{
				$push: { blacklist: { $each: members } },
				$pull: {
					connectedUsers: { $in: userIDs },
					members: { id: { $in: userIDs } },
					mods: { id: { $in: userIDs } }
				}
			}
		);

		// Remove group id from the users
		for (const { id } of members) {
			await User.updateOne({ _id: id }, { $pull: { groupRooms: contactID } });
		}
		
		socket.to(contactID).emit('blockMembers', contactID, members);
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
