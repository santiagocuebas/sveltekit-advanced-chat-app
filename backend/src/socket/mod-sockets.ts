import type { Member } from '../types/global.js';
import type { ModSockets } from '../types/sockets.js';
import { ErrorMessage } from '../dictionary.js';
import { getContact } from '../libs/index.js';
import { User, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const modSockets: ModSockets = (socket, contactID) => {
	socket.on('emitAddMember', async (members: Member[]) => {
		try {
			const userIDs = members.map(({ id }) => id);
	
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
				});
	
			if (group === null) throw new Error();
	
			// Add group id to the users
			await User.updateMany({ _id: userIDs }, { $push: { groupRooms: contactID } });
	
			group.members = [...members, ...group.members];
	
			if (users.length) {
				// Find chats
				const contact = await getContact(contactID, group, TypeContact.GROUP);
	
				if (typeof contact.logged !== 'boolean') {
					contact.logged = [...loggedUsers, ...contact.logged];
				}
					
				socket.to(users.map(user => user.tempId)).emit('addGroup', contact, true);
			}
	
			socket.to(contactID).emit('addMembers', contactID, members, loggedUsers);
			socket.emit('countMembers', contactID, loggedUsers);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitBanMember', async (userIDs: string[]) => {
		try {
			// Remove contacts to the group
			await Group.updateOne(
				{ _id: contactID },
				{
					$pull: {
						loggedUsers: { $in: userIDs },
						members: { id: { $in: userIDs } },
						mods: { id: { $in: userIDs } }
					}
				});
			
			// Remove group id from the users
			await User.updateMany({ _id: userIDs }, { $pull: { groupRooms: contactID } });
		
			const users = await User.find({ _id: userIDs, logged: true });
	
			const loggedUsers = users.map(user => user.id);
	
			if (users.length) {
				socket.to(users.map(user => user.tempId)).emit('leaveGroup', contactID, true);
			}
			
			socket.to(contactID).emit('banMembers', contactID, userIDs, loggedUsers);
			socket.emit('discountMembers', contactID, loggedUsers);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitBlockMember', async (members: Member[]) => {
		try {
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
				});
	
			// Remove group id from the users
			await User.updateMany({ _id: userIDs }, { $pull: { groupRooms: contactID } });
	
			const users = await User.find({ _id: userIDs, logged: true });
			
			const loggedUsers = users.map(user => user.id);
			
			if (users.length) {
				socket.to(users.map(user => user.tempId)).emit('leaveGroup', contactID, true);
			}
			
			socket.to(contactID).emit('blockMembers', contactID, members, loggedUsers);
			socket.emit('discountMembers', contactID, loggedUsers);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitUnblockMember', async (userIDs: string[]) => {
		try {
			// Unblock contacts to the group
			await Group.updateOne(
				{ _id: contactID },
				{ $pull: { blacklist: { id: { $in: userIDs } } } });
			
			socket.to(contactID).emit('unblockMembers', contactID, userIDs);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});
};
