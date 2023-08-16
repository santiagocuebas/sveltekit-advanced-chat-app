import type { MemberSockets } from '../types/sockets.js';
import { User, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const memberSockets: MemberSockets = (socket, [userID, contactID], groupRooms, blacklist) => {
	socket.on('emitLeaveGroup', async () => {
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

		await User.updateOne({ _id: userID }, { $pull: { groupRooms: contactID } });

		groupRooms = groupRooms.filter(id => id !== contactID);
		
		socket.to(contactID).emit('leaveGroup', userID);
		socket.leave(contactID);
	});

	socket.on('emitBlockGroup', async (name: string) => {
		blacklist.push({
			id: contactID,
			name,
			type: TypeContact.GROUP
		});

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

		await User.updateOne(
			{ _id: userID },
			{
				blacklist,
				$pull: { groupRooms: contactID }
			}
		);

		groupRooms = groupRooms.filter(id => id !== contactID);
		
		socket.to(contactID).emit('leaveGroup', userID);
		socket.leave(contactID);
	});

	return [groupRooms, blacklist];
};
