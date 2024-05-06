import type { IGroup, IChat, IUser, IPartialUser } from '../types/global.js';
import type { Contact } from '../types/types.js';
import { Chat, Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

export const getUser = (user: IUser): IPartialUser => {
	return {
		id: user.id,
		username: user.username,
		type: user.type,
		avatar: user.avatar,
		description: user.description,
		blockedUsers: user.blockedUsers,
		blockedGroups: user.blockedGroups
	};
};

export const getContact: Contact = async (roomID, contact, type, id) => {
	const search = (type === TypeContact.GROUP)
		? { to: contact.id, type: TypeContact.GROUP }
		: { from: contact.id, to: id, type: TypeContact.USER };
	
	const chat = await Chat
		.findOne(search)
		.sort({ createdAt: -1 })
		.catch(() => null);

	const data = (typeof contact.logged !== 'boolean')
		? {
			admin: contact.admin,
			members: contact.members,
			mods: contact.mods,
			allIDs: contact.allIDs,
			blacklist: contact.blacklist,
			state: contact.state,
		} : { blockedIDs: contact.blockedUsersIDs };

	return {
		contactID: contact.id,
		roomID,
		type,
		name: contact.name,
		avatar: contact.avatar,
		description: contact.description,
		logged: contact.logged,
		...data,
		content: chat?.content,
		createdAt: chat?.createdAt
	};
};

export const matchId = (group: IGroup, userIDs: string[]) => {
	if (group.state === StateOption.PROTECTED) {
		for (const id of [group.admin, ...group.modIDs, ...group.memberIDs]) {
			if (userIDs.includes(id)) return true;
		}
	}

	return false;
};

export const getId = async (type?: string) => {
	const validChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let id = '';

	for (let i = 0; i < 12; i++) {
		id += validChar.at(Math.floor(Math.random() * validChar.length));
	}

	let data: IUser | IGroup | IChat | null = null;

	if (type === TypeContact.USER) {
		data = await User.findOne({ avatar: { $regex: id + '.*' } });
	} else if (type === TypeContact.GROUP) {
		data = await Group.findOne({ avatar: { $regex: id + '.*' } });
	} else {
		data = await Chat.findOne({ content: { $elemMatch: { $regex: id + '.*' } } });
	}

	if (data !== null) getId(type);

	return id;
};
