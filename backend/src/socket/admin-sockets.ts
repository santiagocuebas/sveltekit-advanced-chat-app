import type { Members } from '../types/global.js';
import type { AdminSockets } from '../types/sockets.js';
import fs from 'fs-extra';
import { resolve } from 'path';
import { User, Group, Chat } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const adminSockets: AdminSockets = (socket, [userID, contactID], groupRooms) => {
	socket.on('emitAddMod', async (mods: Members[]) => {
		const userIDs = mods.map(mods => mods.id);

		await Group.updateOne(
			{ _id: contactID, admin: userID },
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
			{ _id: contactID, admin: userID },
			{
				$push: { members },
				$pull: { mods: { id: { $in: userIDs } } }
			}
		);
		
		socket.to(contactID).emit('modChange', userID);
	});

	socket.on('emitChangeAvatar', async (filename: string) => {
		socket.emit('changeAvatar', contactID, TypeContact.GROUP, filename);
		socket.to(groupRooms).emit('changeAvatar', contactID, TypeContact.GROUP, filename);
	});

	socket.on('emitChangeDescription', async (description: string) => {
		await Group.updateOne({ _id: contactID, admin: userID }, { description });
	});

	socket.on('emitChangeState', async (state: string) => {
		await Group.updateOne({ _id: contactID, admin: userID }, { state });
	});

	socket.on('emitDestroyGroup', async () => {
		const group = await Group
			.findOneAndDelete({ _id: contactID, admin: userID })
			.lean({ virtuals: true });

		if (group !== null) {
			[group.admin, ...group.modIDs, ...group.memberIDs].forEach(async id => {
				await User.updateOne({ _id: id }, { $pull: { groupRooms: contactID } });
			});

			await Chat.deleteMany({ to: contactID });

			if (group.avatar !== 'avatar.jpeg') {
				const path = resolve(`uploads/group-avatar/${group.avatar}`);
				await fs.unlink(path);
			}

			groupRooms = groupRooms.filter(id => id !== contactID);
		
			socket.to(contactID).emit('leaveGroup', contactID);
			socket.leave(contactID);
		}
	});

	return groupRooms;
};
