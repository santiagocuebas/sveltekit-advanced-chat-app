import type {
	Chats,
	IGroup,
	IChat,
	IUser,
	Member,
	IPartialUser
} from '../types/global.js';
import type { Contact, IKeys } from '../types/types.js';
import { Chat, Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

export const getUser = (user: IUser): IPartialUser => {
	return {
		id: user.id,
		username: user.username,
		avatar: user.avatar,
		description: user.description,
		blockedUsers: user.blockedUsers,
		blockedGroups: user.blockedGroups
	};
};

export const getContact: Contact = (contactID, roomID, contact, type, chat) => {
	const data: IKeys<string | string[] | Member[]> = {};

	if ((contact as IGroup).admin) {
		const group = contact as IGroup;

		data.admin = group.admin;
		data.members = group.members;
		data.mods = group.mods;
		data.blacklist = group.blacklist;
		data.state = group.state;
	} else {
		const user = contact as IUser;

		data.blockedIDs = user.blockedUsersIDs;
	}

	return {
		contactID,
		roomID,
		name: contact.name,
		avatar: contact.avatar,
		description: contact.description,
		logged: typeof contact.logged === 'number' ? contact.logged++ : contact.logged,
		type,
		...data,
		content: chat?.content,
		createdAt: chat?.createdAt
	};
};

export const matchId = (group: IGroup, userIDs: string[]) => {
	let match = false;

	if (group.state === StateOption.PROTECTED) {
		for (const id of [group.admin, ...group.modIDs, ...group.memberIDs]) {
			if (userIDs.includes(id)) {
				match = true;
				break;
			}
		}
	}

	return match;
};

export const getId = async (type?: string): Promise<string> => {
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

export const getChats: Chats = async (userID, contactID, type) => {
	let findQuery = { };

	if (type === TypeContact.USER) {
		findQuery = {
			$or: [
				{ from: userID, to: contactID },
				{ from: contactID, to: userID }
			]
		};
	} else findQuery = { to: contactID };

	return await Chat
		.find(findQuery)
		.sort({ createdAt: 1 });
};
