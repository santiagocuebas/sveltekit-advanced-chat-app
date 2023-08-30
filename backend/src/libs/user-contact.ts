import type { Users } from '../types/global.js';
import type { IContact } from '../types/types.js';
import { User, Chat, Group } from '../models/index.js';
import { TypeContact } from '../types/enums.js';
import { getContact } from './get-data.js';

export const getUserContacts = async (id: string, userContacts: Users[]): Promise<[IContact[], string[]]> => {
	const contacts: IContact[] = [];
	const contactsToDelete: string[] = [];

	for (const { userID, roomID } of userContacts) {
		const contact = await User
			.findOne({ _id: userID })
			.select('username avatar users logged')
			.lean({ virtuals: true });

		if (contact !== null) {
			const chat = await Chat
				.findOne({ from: userID, to: id })
				.sort({ createdAt: -1 });

			const data = getContact(userID, roomID, contact, TypeContact.USER, chat);

			contacts.push(data);
		} else contactsToDelete.push(roomID);
	}

	if (contactsToDelete.length > 0) {
		await User.updateOne(
			{ _id: id },
			{ $pull: { users: { roomID: { $in: contactsToDelete } } } }
		);
	}

	return [contacts, contactsToDelete];
};

export const getGroupContacts = async (id: string, groupContacts: string[]): Promise<[IContact[], string[]]> => {
	const contacts: IContact[] = [];
	const contactsToDelete: string[] = [];

	for (const key of groupContacts) {
		const contact = await Group
			.findOneAndUpdate({ _id: key }, { $addToSet: { connectedUsers: id } })
			.lean({ virtuals: true });

		if (contact !== null) {
			const chat = await Chat
				.findOne({ to: key })
				.sort({ createdAt: -1 });

			const data = getContact(key, key, contact, TypeContact.GROUP, chat);

			contacts.push(data);
		} else contactsToDelete.push(key);
	}

	if (contactsToDelete.length > 0) {
		await User.updateOne(
			{ _id: id },
			{ $pull: { groupContacts: { $in: contactsToDelete } } }
		);
	}

	return [contacts, contactsToDelete];
};
