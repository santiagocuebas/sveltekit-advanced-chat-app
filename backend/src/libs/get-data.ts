import type { PartialUser, Chats } from '../types/global.js';
import type { Contact } from '../types/types.js';
import { Chat } from '../models/index.js';

export const getUser: PartialUser = ({ id, username, avatar, description, blacklist }) => {
	return { id, username, avatar, description, blacklist };
};

export const getContact: Contact = (contactID, roomID, contact, type, chat) => {
	const { name, avatar, logged, admin, mods, members, blacklist } = contact as never;

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
		content: chat?.content,
		createdAt: chat?.createdAt
	};
};

export const getChats: Chats = async (userID, contactID, roomID) => {
	let findQuery = { };

	if (roomID.length > 24) {
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
