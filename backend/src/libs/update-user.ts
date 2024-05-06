import type { FilterQuery } from 'mongoose';
import type { IChat } from '../types/global.js';
import type { ActUser } from '../types/types.js';
import { deleteFile } from './index.js';
import { Chat } from '../models/index.js';
import { Folder, QueryOption, TypeContact } from '../types/enums.js';

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

export const deleteChats = async (IDs: string[], option: string) => {
	const queryOption: FilterQuery<IChat> = { };

	if (option === QueryOption.USER) {
		queryOption['$or'] = [{ from: IDs[0], to: IDs[1], type: TypeContact.USER },
			{ from: IDs[1], to: IDs[0], type: TypeContact.USER }];
	} else if (option === QueryOption.GROUP) {
		queryOption['to'] = IDs[0];
		queryOption['type'] = TypeContact.GROUP;
	} else if (option === QueryOption.SETTINGS) {
		queryOption['$or'] = [{ from: IDs[0], type: TypeContact.USER },
			{ to: IDs[0], type: TypeContact.USER }];
	} else {
		queryOption['to'] = IDs;
		queryOption['type'] = TypeContact.GROUP;
	}

	const chats = await Chat.find(queryOption);
	
	for (const chat of chats) {
		if (chat.content instanceof Array) {
			for (const file of chat.content) {
				deleteFile(file, Folder.PUBLIC);
			}
		}
	}

	await Chat.deleteMany(queryOption);
};
