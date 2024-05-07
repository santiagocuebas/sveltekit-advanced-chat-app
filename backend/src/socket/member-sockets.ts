import type { MemberSockets } from '../types/sockets.js';
import { ErrorMessage } from '../dictionary.js';
import { User, Group } from '../models/index.js';

export const memberSockets: MemberSockets = (socket, [userID, contactID], user) => {
	socket.on('emitLeaveGroup', async () => {
		try {
			// Remove user id from the group
			await Group.updateOne(
				{ _id: contactID },
				{
					$pull: {
						loggedUsers: userID,
						mods: { id: userID },
						members: { id: userID }
					}
				});
	
			// Remove group id
			await User.updateOne({ _id: userID }, { $pull: { groupRooms: contactID } });
	
			user.groupRooms = user.groupRooms.filter(id => id !== contactID);
			socket.to(contactID).emit('banMembers', contactID, [userID], [userID]);
			socket.leave(contactID);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitBlockGroup', async (name: string) => {
		try {
			// Remove user id from the group
			await Group.updateOne(
				{ _id: contactID },
				{
					$pull: {
						loggedUsers: userID,
						mods: { id: userID },
						members: { id: userID }
					}
				});
			
			user.groupRooms = user.groupRooms.filter(id => id !== contactID);
			user.blockedGroups.push({ id: contactID, name });
			user.blockedGroupsIDs.push(contactID);
	
			// Remove and block group id
			await User.updateOne(
				{ _id: userID },
				{ blockedGroups: user.blockedGroups, groupRooms: user.groupRooms });
	
			socket.to(contactID).emit('banMembers', contactID, [userID], [userID]);
			socket.leave(contactID);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});
};
