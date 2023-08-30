import type { PartialUser, Chats } from '../types/global.js';
import type { Contact } from '../types/types.js';
import { Chat, Group, User } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const getUser: PartialUser = ({ id, username, avatar, description, blacklist }) => {
	return { id, username, avatar, description, blacklist };
};

export const getContact: Contact = (contactID, roomID, contact, type, chat) => {
	const {
		name,
		description,
		avatar,
		logged,
		admin,
		mods,
		members,
		blacklist
	} = contact as never;

	return {
		contactID,
		roomID,
		name,
		avatar,
		logged: typeof logged === 'number' ? logged + 1 : logged,
		description,
		type,
		admin,
		mods,
		members,
		blacklist,
		content: chat?.content,
		createdAt: chat?.createdAt
	};
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
