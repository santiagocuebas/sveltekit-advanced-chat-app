import type { ActUser } from '../types/types.js';
import fs from 'fs/promises';
import { resolve } from 'path';
import { getChats } from './get-data.js';

export const actUser: ActUser = (contactID, roomID, user, name) => {
	user.users = user.users.filter(user => user.userID !== contactID);
	user.userIDs = user.userIDs.filter(id => id !== contactID);
	user.userRooms = user.userRooms.filter(id => id !== roomID);
	
	if (name !== undefined) {
		user.blockedUsers.push({ id: contactID, name });
		user.blockedUsersIDs.push(contactID);
	}

	return user;
};

export const deleteChats = async (userID: string, contactID: string) => {
	const chats = await getChats(contactID, userID);

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
