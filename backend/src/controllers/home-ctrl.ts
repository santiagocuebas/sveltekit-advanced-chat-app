import type { Users } from '../types/global.js';
import type { Direction, IContact, IKeys } from '../types/types.js';
import fs from 'fs/promises';
import { resolve } from 'path';
import { AvailableExts } from '../dictionary.js';
import { getId, matchId, getChats, getContact } from '../libs/index.js';
import { Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

export const getAllContacts: Direction = async (req, res) => {
	const{ id, users, userIDs, groupRooms } = req.user;

	// Get data of the contacts
	const contactList: IKeys<IContact[]> = { users: [], groups: [] };

	const contacts = await User
		.find({ _id: userIDs })
		.select('username avatar users blockedGroups logged')
		.lean({ virtuals: true });

	for (const contact of contacts) {
		const { roomID } = users.find(user => user.userID === contact.id) as Users;

		const data = await getContact(roomID, contact, TypeContact.USER, id);

		contactList.users.push(data);
	}

	const groups = await Group
		.find({ _id: groupRooms })
		.lean({ virtuals: true });

	for (const group of groups) {
		const data = await getContact(group.id, group, TypeContact.GROUP);

		contactList.groups.push(data);
	}

	return res.json(contactList);
};

export const getContactChats: Direction = async (req, res) => {
	const userID = req.query.type === 'users' ? req.user.id : undefined;
	const contactID = String(req.query.id);
	const skip = Number(req.query.skip);

	// Get chats from the contacts
	const chats = await getChats(contactID, userID, skip, 50);

	return res.json(chats);
};

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

export const postAudiovisual: Direction = async (req, res) => {
	const files = req.files instanceof Array ? req.files : [];
	const filenames: string[] = [];

	for (const file of files) {
		const avatarURL = await getId() + AvailableExts[file.mimetype];
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
		const avatarURL = await getId(TypeContact.GROUP) +
			AvailableExts[req.file.mimetype];
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
