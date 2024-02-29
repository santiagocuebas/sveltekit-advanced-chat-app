import type { Direction, IKeys } from '../types/types.js';
import fs from 'fs/promises';
import { extname, resolve } from 'path';
import { getId, matchId, matchPassword } from '../libs/index.js';
import { Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

export const getSearch: Direction = async (req, res) => {
	const { param } = req.params;
	const {
		id,
		userIDs,
		groupRooms,
		blockedUsersIDs,
		blockedGroupsIDs
	} = req.user;

	// Find contacts
	const users = await User
		.find({
			$or: [
				{ username: { $regex: '.*' + param + '.*' } },
				{ email: param }
			]
		})
		.lean({ virtuals: true })
		.select('id username avatar description users blockedUsers')
		.limit(150);
		
	const groups = await Group
		.find({ name: { $regex: '.*' + param + '.*' } })
		.lean({ virtuals: true })
		.limit(150);

	const contacts: IKeys<string>[] = [];

	for (const user of users) {
		if (
			user.id !== id &&
			!userIDs.includes(user.id) &&
			!blockedUsersIDs.includes(user.id) &&
			!user.blockedUsersIDs.includes(id)
		) {
			contacts.push({
				contactID: user.id,
				name: user.name,
				avatar: user.avatar,
				description: user.description,
				type: TypeContact.USER
			});
		}
	}

	for (const group of groups) {
		if (
			!groupRooms.includes(group.id) &&
			!blockedGroupsIDs.includes(group.id) &&
			!group.blockedIDs.includes(id) &&
			(group.state === StateOption.PUBLIC || matchId(group, userIDs))
		) {
			contacts.push({
				contactID: group.id,
				name: group.name,
				avatar: group.avatar,
				description: group.description,
				type: TypeContact.GROUP
			});
		}
	}

	return res.json({ contacts });
};

export const postPassword: Direction = async (req, res) => {
	const { password } = req.body;
	let match = false;

	if (typeof password === 'string') {
		// Check if is correct password
		match = await matchPassword(password, req.user.password);
	}

	return res.json({ match });
};

export const postImages: Direction = async (req, res) => {
	const files = req.files as Express.Multer.File[];
	const filenames: string[] = [];

	for (const file of files) {
		const ext = extname(file.originalname).toLowerCase();
		const avatarURL = await getId() + ext;
		const targetPath = resolve(avatarURL);
 
		// Set avatar location
		await fs.rename(file.path, targetPath);

		filenames.push(avatarURL);
	}

	return res.json({ filenames });
};

export const postAvatar: Direction = async (req, res) => {
	const group = await Group.findOne({ _id: req.body.id, admin: req.user.id });
	
	if (group !== null && req.file) {
		const ext = extname(req.file?.originalname as string).toLowerCase();
		const avatarURL = await getId(TypeContact.GROUP) + ext;
		const oldPath = resolve(group.avatar);
		const targetPath = resolve(avatarURL);

		// Unlink old avatar
		if (!group.avatar.includes('avatar.jpeg')) await fs
			.unlink(oldPath)
			.catch(err => console.error(err));
					
		// Set avatar location
		await fs.rename(req.file.path, targetPath);

		// Update database with the new avatar
		group.avatar = avatarURL;
		await group.save();

		return res.json({ filename: avatarURL });
	}

	return res.json(null);
};
