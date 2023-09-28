import type { Members } from '../types/global.js';
import type { AdminSockets } from '../types/sockets.js';
import fs from 'fs-extra';
import { resolve } from 'path';
import { User, Group, Chat } from '../models/index.js';

export const adminSockets: AdminSockets = (socket, [userID, contactID]) => {
	socket.on('emitAddMod', async (mods: Members[]) => {
		const userIDs = mods.map(mods => mods.id);

		await Group.updateOne(
			{ _id: contactID, admin: userID },
			{
				$push: { mods: { $each: mods } },
				$pull: { members: { id: { $in: userIDs } } }
			}
		);
		
		socket.to(contactID).emit('addMods', contactID, mods);
	});

	socket.on('emitRemoveMod', async (members: Members[]) => {
		const userIDs = members.map(member => member.id);

		await Group.updateOne(
			{ _id: contactID, admin: userID },
			{
				$push: { members: { $each: members } },
				$pull: { mods: { id: { $in: userIDs } } }
			}
		);
		
		socket.to(contactID).emit('removeMods', contactID, members);
	});

	socket.on('emitChangeAvatar', async (filename: string) => {
		socket.to(contactID).emit('changeAvatar', contactID, filename);
	});

	socket.on('emitChangeDescription', async (description: string) => {
		await Group.updateOne({ _id: contactID, admin: userID }, { description });
	});

	socket.on('emitChangeState', async (state: string) => {
		await Group.updateOne({ _id: contactID, admin: userID }, { state });
	});

	socket.on('emitDestroyGroup', async () => {
		socket.to(contactID).emit('leaveGroup', userID, contactID);

		const group = await Group
			.findOneAndDelete({ _id: contactID, admin: userID })
			.lean({ virtuals: true });

		if (group !== null) {
			[userID, ...group.modIDs, ...group.memberIDs].forEach(async id => {
				await User.updateOne({ _id: id }, { $pull: { groupRooms: contactID } });
			});

			const chats = await Chat.find({ to: contactID });

			for (const chat of chats) {
				if (chat.content instanceof Array) {
					for (const url of chat.content) {
						const path = resolve(`uploads/${url}`);
						await fs.unlink(path);
					}
				}

				chat.deleteOne();
			}

			if (group.avatar !== 'avatar.jpeg') {
				const path = resolve(`uploads/group-avatar/${group.avatar}`);
				await fs.unlink(path);
			}

			socket.user.groupRooms = socket.user.groupRooms.filter(id => id !== contactID);
		
			socket.leave(contactID);
		}
	});
};
