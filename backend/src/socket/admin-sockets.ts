import type { IGroup, Members } from '../types/global.js';
import type { AdminSockets } from '../types/sockets.js';
import { User, Group, Chat } from '../models/index.js';

export const adminSockets: AdminSockets = (socket, [userID, contactID], groupRooms) => {
	socket.on('emitAddMod', async (mods: Members[]) => {
		const userIDs = mods.map(mods => mods.id);

		await Group.updateOne(
			{ _id: contactID },
			{
				$push: { mods },
				$pull: { members: { id: { $in: userIDs } } }
			}
		);
		
		socket.to(contactID).emit('modChange', userID);
	});

	socket.on('emitRemoveMod', async (members: Members[]) => {
		const userIDs = members.map(member => member.id);

		await Group.updateOne(
			{ _id: contactID },
			{
				$push: { members },
				$pull: { mods: { id: { $in: userIDs } } }
			}
		);
		
		socket.to(contactID).emit('modChange', userID);
	});

	socket.on('emitChangeState', async (state: string) => {
		await Group.updateOne({ _id: contactID }, { state });
	});

	socket.on('emitDestroyGroup', async () => {
		const { admin, mods, members } = await Group
			.findOneAndDelete({ _id: contactID })
			.select('admin mods members') as IGroup;
			
		const contactsIDs = [...mods, ...members].map(user => user.id);

		[admin, ...contactsIDs].forEach(async id => {
			await User.updateOne({ _id: id }, { $pull: { groupRooms: contactID } });
		});

		await Chat.deleteMany({ to: contactID });

		groupRooms = groupRooms.filter(id => id !== contactID);
		
		socket.to(contactID).emit('leaveGroup', contactID);
		socket.leave(contactID);
	});

	return groupRooms;
};
