import type { MemberSockets } from '../types/sockets.js';
import { User, Group } from '../models/index.js';

export const memberSockets: MemberSockets = (socket, [userID, contactID], user) => {
	socket.on('emitLeaveGroup', async () => {
		socket.to(contactID).emit('banMembers', contactID, userID);

		// Remove user id from the group
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

		user.groupRooms = user.groupRooms.filter(id => id !== contactID);

		// Remove group id
		await User.updateOne({ _id: userID }, { groupRooms: user.groupRooms });

		socket.leave(contactID);
	});

	socket.on('emitBlockGroup', async (name: string) => {
		socket.to(contactID).emit('banMembers', contactID, userID);

		// Remove user id from the group
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

		user.groupRooms = user.groupRooms.filter(id => id !== contactID);
		user.blockedGroups.push({ id: contactID, name });
		user.blockedGroupsIDs.push(contactID);

		// Remove and block group id
		await User.updateOne(
			{ _id: userID },
			{ blockedGroups: user.blockedGroups, groupRooms: user.groupRooms }
		);

		socket.leave(contactID);
	});
};
