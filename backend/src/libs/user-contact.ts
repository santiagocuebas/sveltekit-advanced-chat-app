import type { IGroup, IUser, Users } from '../types/global.js';
import type { IContact } from '../types/types.js';
import { User, Chat, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';
import { getContact } from './get-data.js';

export const getUserContacts = async (id: string, userContacts: Users[]) => {
	const contacts: IContact[] = [];

	for (const { userID, roomID } of userContacts) {
		const contact = await User
			.findOne({ _id: userID })
			.select('username avatar users logged')
			.lean({ virtuals: true }) as IUser;

		const chat = await Chat
			.findOne({ from: userID, to: id })
			.sort({ createdAt: -1 });

		const data = getContact(userID, roomID, contact, TypeContact.USER, chat);

		contacts.push(data);
	}

	return contacts;
};

export const getGroupContacts = async (id: string, groupContacts: string[]) => {
	const contacts: IContact[] = [];

	for (const key of groupContacts) {
		const contact = await Group
			.findOneAndUpdate({ _id: key }, { $addToSet: { connectedUsers: id } })
			.select('admin mods members name avatar connectedUsers blacklist')
			.lean({ virtuals: true }) as IGroup;

		const chat = await Chat
			.findOne({ to: key })
			.sort({ createdAt: -1 });

		const data = getContact(key, key, contact, TypeContact.GROUP, chat);

		contacts.push(data);
	}

	return contacts;
};
