import type { PartialUser, Chats, IGroup } from '../types/global.js';
import type { Contact } from '../types/types.js';
import { Chat, Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

export const getUser: PartialUser = ({ id, username, avatar, description, blockedUsers, blockedGroups }) => {
	return { id, username, avatar, description, blockedUsers, blockedGroups };
};

export const getContact: Contact = (contactID, roomID, contact, type, chat) => {
	const {
		name,
		description,
		avatar,
		blockedGroupsIDs,
		logged,
		admin,
		mods,
		members,
		blacklist,
		state
	} = contact as never;

	return {
		contactID,
		roomID,
		name,
		avatar,
		logged: typeof logged === 'number' ? logged + 1 : logged,
		type,
		admin,
		mods,
		members,
		blacklist,
		blockedIDs: blockedGroupsIDs,
		description,
		state,
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

export const getId = async (): Promise<string> => {
	const validChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let id = '';

	for (let i = 0; i < 12; i++) {
		id += validChar.at(Math.floor(Math.random() * validChar.length));
	}

	const user = await User.findOne({ avatar: { $regex: id + '.*' } });

	if (user !== null) getId();

	return id;
};

export const getGroupId = async (): Promise<string> => {
	const validChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let id = '';

	for (let i = 0; i < 12; i++) {
		id += validChar.at(Math.floor(Math.random() * validChar.length));
	}

	const group = await Group.findOne({ avatar: { $regex: id + '.*' } });

	if (group !== null) getGroupId();

	return id;
};

export const getChats: Chats = async ([userID, contactID], type) => {
	let findQuery = { };

	if (type !== TypeContact.GROUP) {
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
