import type { Direction } from '../types/types.js';
import {
	deleteChats,
	deleteFile,
	encryptPassword,
	loadFile,
	queryResult
} from '../libs/index.js';
import { Group, User } from '../models/index.js';
import { QueryOption, TypeContact } from '../types/enums.js';

export const postAvatar: Direction = async (req, res) => {
	const file = await loadFile(req.file, TypeContact.USER);

	// Unlink old avatar
	if (!req.user.avatar.includes('avatar.png') && file !== null) {
		deleteFile(req.user.avatar);
	}

	// Update database with the new avatar
	const [status, success, message, filename] = file !== null
		? await queryResult(req.user.id, { avatar: file }, file)
		: [401, false, 'An error occurred while trying to uploaded the image'];
	
	return res.status(status).json({ success, filename, message });
};

export const postUsername: Direction = async (req, res) => {
	// Change username
	const [status, success, message] = await queryResult(req.user.id,
		{ username: req.body.username });
	
	return res.status(status).json({ success, message });
};

export const postDescription: Direction = async (req, res) => {
	// Change description
	const [status, success, message] = await queryResult(req.user.id,
		{ description: req.body.description });
	
	return res.status(status).json({ success, message });
};

export const postPassword: Direction = async (req, res) => {
	const password = await encryptPassword(req.body.newPassword)
		.catch(() => null);

	// Change password
	const [status, success, message] = password !== null
		? await queryResult(req.user.id, { password })
		: [401, false, 'An error occurred while trying to encrypt the password'];
	
	return res.status(status).json({ success, message });
};

export const postUnblock: Direction = async (req, res) => {
	// Unblock contacts
	const query = {
		$pull: {
			blockedUsers: { id: { $in: req.body.unblockUsers } },
			blockedGroups: { id: { $in: req.body.unblockGroups } }
		}
	};

	const [status, success, message] = await queryResult(req.user.id, query);

	return res.status(status).json({ success, message });
};

export const deleteUser: Direction = async (req, res) => {
	try {
		const { id, userIDs, groupRooms } = req.user;
	
		// Delete user
		const user = await User.findOne({ _id: id });

		if (user === null) return res.json({ delete: false });

		// Unlink avatar
		if (!user.avatar.includes('avatar.png')) deleteFile(user.avatar);

		// Find and delete chats
		await deleteChats([id], QueryOption.SETTINGS);

		// Delete user id from the contacts
		await User.updateMany(
			{ _id: userIDs },
			{ $pull: { users: { userID: id } } });

		await Group.updateMany(
			{ _id: groupRooms },
			{
				$pull: {
					loggedUsers: { $in: userIDs },
					members: { id: { $in: userIDs } },
					mods: { id: { $in: userIDs } }
				}
			});

		// Find and delete groups where the user is the admin
		const groups = await Group.find({ admin: id });
		const groupsIDs: string[] = [];

		for (const group of groups) {
		// Unlink avatar
			if (!group.avatar.includes('avatar.png')) {
				deleteFile(group.avatar);
			}

			groupsIDs.push(group.id);
		}

		// Delete chats of the groups
		await deleteChats(groupsIDs, QueryOption.GROUPS);
		await Group.deleteMany({ admin: id });
		await user.deleteOne();

		return res.json({ success: true });
	} catch {
		return res.status(401).json({
			success: false,
			message: 'A database error occurred while attempting to delete the user'
		});
	}
};
