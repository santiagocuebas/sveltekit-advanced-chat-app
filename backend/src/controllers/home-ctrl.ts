import type { Users } from '../types/global.js';
import type { Direction, IContact, IKeys } from '../types/types.js';
import { matchId, getContact, deleteFile, loadFile } from '../libs/index.js';
import { Chat, Group, User } from '../models/index.js';
import { QueryType, StateOption, TypeContact } from '../types/enums.js';

export const getAllContacts: Direction = async (req, res) => {
	const { id, users, userIDs, groupRooms } = req.user;

	// Get data of the contacts
	const contactList: IKeys<IContact[]> = { users: [], groups: [] };

	const contacts = await User
		.find({ _id: userIDs })
		.select('username avatar users blockedGroups logged')
		.lean({ virtuals: true })
		.catch(() => []);

	for (const contact of contacts) {
		const { roomID } = users.find(user => user.userID === contact.id) as Users;

		const data = await getContact(roomID, contact, TypeContact.USER, id);

		contactList.users.push(data);
	}

	const groups = await Group
		.find({ _id: groupRooms })
		.lean({ virtuals: true })
		.catch(() => []);

	for (const group of groups) {
		const data = await getContact(group.id, group, TypeContact.GROUP);

		contactList.groups.push(data);
	}

	return res.json(contactList);
};

export const getContactChats: Direction = async (req, res) => {
	const userID = req.query.type === QueryType.USERS ? req.user.id : undefined;
	const contactID = String(req.query.id);
	const skip = Number(req.query.skip);

	// Get chats from the contacts
	const findQuery = userID !== undefined
		? {
			$or: [
				{ from: req.user.id, to: contactID, type: TypeContact.USER },
				{ from: contactID, to: req.user.id, type: TypeContact.USER }
			]
		} : { to: contactID, type: TypeContact.GROUP };

	const chats = await Chat
		.find(findQuery)
		.skip(skip)
		.limit(50)
		.sort({ createdAt: -1 });

	return res.json(chats);
};

export const getSearch: Direction = async (req, res) => {
	const param = String(req.query.param);
	const { id, userIDs, groupRooms, blockedUsersIDs, blockedGroupsIDs } = req.user;

	// Find contacts
	const users = await User
		.find({
			$or: [{ username: { $regex: '.*' + param + '.*' } }, { email: param }]
		})
		.lean({ virtuals: true })
		.select('id username avatar description users blockedUsers')
		.limit(150)
		.catch(() => []);
		
	const groups = await Group
		.find({ name: { $regex: '.*' + param + '.*' } })
		.lean({ virtuals: true })
		.limit(150)
		.catch(() => []);

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
	const contactID = String(req.query.id);
	const type = String(req.query.type);
	const filenames: string[] = [];

	for (const fileBuffer of files) {
		const filename = await loadFile(fileBuffer);

		if (filename !== null) filenames.push(filename);
	}

	if (filenames.length === 0) return res.status(401).json(
		{ message: 'An error occurred while trying to upload the file(s)' });

	const chat = await Chat
		.create({
			from: req.user.id,
			to: contactID,
			type,
			username: (type === TypeContact.GROUP) ? req.user.username : undefined,
			content: filenames,
			createdAt: new Date
		})
		.catch(() => null);

	if (chat === null) return res.status(401).json(
		{ message: 'An error has occurred with the database' });

	return res.json(chat);
};

export const postAvatar: Direction = async (req, res) => {
	try {
		const group = await Group.findOne({ _id: req.body.id, admin: req.user.id });
		
		if (group === null) return res.status(401).json(null);
		
		const filename = await loadFile(req.file, TypeContact.GROUP);
	
		if (!filename) return res.status(401).json(null);
	
		// Unlink old avatar
		if (!group.avatar.includes('avatar.jpeg')) {
			deleteFile(group.avatar);
		}
	
		// Update database with the new avatar
		group.avatar = filename;
		await group.save();
	
		return res.json({ filename });
	} catch {
		return res.status(401).json(null);
	}
};
