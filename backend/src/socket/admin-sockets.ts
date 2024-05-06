import type { Member } from '../types/global.js';
import type { AdminSockets } from '../types/sockets.js';
import { ErrorMessage } from '../dictionary.js';
import { deleteChats, deleteFile } from '../libs/index.js';
import { User, Group } from '../models/index.js';
import { Folder, QueryOption } from '../types/enums.js';

export const adminSockets: AdminSockets = (socket, [userID, contactID]) => {
	socket.on('emitAddMod', async (mods: Member[]) => {
		try {
			// Add mods to the group
			await Group.updateOne(
				{ _id: contactID, admin: userID },
				{
					$push: { mods: { $each: mods } },
					$pull: { members: { id: { $in: mods.map(mods => mods.id) } } }
				});
	
			socket.to(contactID).emit('addMods', contactID, mods);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitRemoveMod', async (members: Member[]) => {
		try {
			// Remove mods from the group
			await Group.updateOne(
				{ _id: contactID, admin: userID },
				{
					$push: { members: { $each: members } },
					$pull: { mods: { id: { $in: members.map(member => member.id) } } }
				});
			
			socket.to(contactID).emit('removeMods', contactID, members);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});

	socket.on('emitChangeAvatar', async (filename: string) => {
		socket.to(contactID).emit('changeAvatar', contactID, filename);
	});

	socket.on('emitChangeDescription', async (description: string) => {
		// Update group description
		const result = await Group
			.updateOne({ _id: contactID, admin: userID }, { description })
			.catch(() => null);

		if (result === null) socket.emit('socketError', ErrorMessage.failureDatabase);
	});

	socket.on('emitChangeState', async (state: string) => {
		// Update group state
		const result = await Group
			.updateOne({ _id: contactID, admin: userID }, { state })
			.catch(() => null);

		if (result === null) socket.emit('socketError', ErrorMessage.failureDatabase);
	});

	socket.on('emitDestroyGroup', async () => {
		try {
			// Find and delete chats
			await deleteChats([contactID], QueryOption.GROUP);

			// Delete a group
			const group = await Group.findOne({ _id: contactID, admin: userID });

			if (group === null) throw new Error();

			// Remove group id from the contacts
			await User.updateMany(
				{ _id: [userID, ...group.modIDs, ...group.memberIDs] },
				{ $pull: { groupRooms: contactID } });

			// Unlink avatar
			if (!group.avatar.includes('avatar.png')) {
				deleteFile(group.avatar, Folder.GROUP);
			}

			await group.deleteOne();
	
			socket.user.groupRooms = socket.user.groupRooms.filter(id => id !== contactID);
			socket.to(contactID).emit('leaveGroup', contactID, true);
			socket.leave(contactID);
		} catch {
			socket.emit('socketError', ErrorMessage.failureDatabase);
		}
	});
};
