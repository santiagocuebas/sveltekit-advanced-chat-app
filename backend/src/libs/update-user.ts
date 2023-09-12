import type { ActUser } from '../types/types.js';
import fs from 'fs-extra';
import { resolve } from 'path';
import { Chat } from '../models/index.js';
import { TypeContact } from '../types/enums.js';

export const actUser: ActUser = (contactID, roomID, user, name) => {
	user.users = user.users.filter(user => user.userID !== contactID);
	user.userIDs = user.userIDs.filter(id => id !== contactID);
	user.userRooms = user.userRooms.filter(id => id !== roomID);
	
	if (name) {
		user.blacklist.push({
			id: contactID,
			name,
			type: TypeContact.USER
		});
	}

	return user;
};

export const deleteChats = async (userID: string, contactID: string) => {
	const chats = await Chat.find({
		$or: [
			{ from: userID, to: contactID },
			{ from: contactID, to: userID }
		]
	});

	for (const chat of chats) {
		if (chat.content instanceof Array) {
			for (const url of chat.content) {
				const path = resolve(`uploads/${url}`);
				await fs.unlink(path);
			}
		}

		chat.deleteOne();
	}
};
