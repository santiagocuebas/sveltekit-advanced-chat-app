import type { MemberSockets } from '../types/sockets.js';
import { User, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const memberSockets: MemberSockets = (socket, [userID, contactID], user) => {
	socket.on('emitLeaveGroup', async () => {
		socket.to(contactID).emit('leaveGroup', contactID, true);

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

		await User.updateOne({ _id: userID }, { groupRooms: user.groupRooms });

		socket.leave(contactID);
	});

	socket.on('emitBlockGroup', async (name: string) => {
		socket.to(contactID).emit('leaveGroup', contactID, true);

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
		user.blacklist.push({
			id: contactID,
			name,
			type: TypeContact.GROUP
		});

		await User.updateOne(
			{ _id: userID },
			{ blacklist: user.blacklist, groupRooms: user.groupRooms }
		);

		socket.leave(contactID);
	});
};
