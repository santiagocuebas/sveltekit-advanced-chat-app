import type { IUser, Member } from '../types/global.js';
import type { GroupInit, IContact, IKeys } from '../types/types.js';
import {
	existsImage,
	groupList,
	isArray,
	isLength,
	isObject,
	isString,
	isValidKey,
	isValidUsers,
	isValidUser
} from './socket-custom.js';
import { ErrorMessage } from '../dictionary.js';
import { Chat, Group, User } from '../models/index.js';
import { StateOption, TypeContact } from '../types/enums.js';

export const joinUserRoom = (
	[contactID, roomID]: [string, string],
	{ id, userIDs, userRooms }: IUser
) => {
	return (
		isString(contactID) &&
		isString(roomID) &&
		userIDs.includes(contactID) &&
		userRooms.includes(roomID) &&
		(contactID + id === roomID || id + contactID === roomID)
	) ? true : ErrorMessage.connectRoom;
};

export const joinGroupRoom = ([contactID]: [string], { groupRooms }: IUser) => {
	return (isString(contactID) && groupRooms.includes(contactID))
		? true
		: ErrorMessage.connectRoom;
};

export const createChat = async ([chat, tempID]: [string & string[], string]) => {
	return (
		isString(tempID) &&
		((isString(chat) && isLength(chat, 0, 420)) || (isArray(chat) && isLength(chat, 0, 3) && await existsImage(chat)))
	) ? true : ErrorMessage.createChat;
};

export const deleteChat = async ([id]: [string]) => {
	if (isString(id)) {
		const chat = await Chat.findOne({ _id: id });

		if (chat !== null) return true;
	}

	return ErrorMessage.deleteChat;
};

export const blockGroup = ([name]: [string]) => {
	return (isString(name) && isLength(name, 3, 40)) ? true : ErrorMessage.blockGroup;
};

export const addMembers = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(members) &&
		isLength(members, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { allIDs, validIDs } = groupList(group);

			for (const member of members) {
				if (
					!isObject(member) ||
					!isString(member.id) ||
					!isString(member.name) ||
					allIDs.includes(member.id) ||
					!validIDs.includes(id) ||
					await isValidUser(groupID, member)
				) return ErrorMessage.addMembers;
			}

			return true;
		}
	}

	return ErrorMessage.connectRoom;
};

export const banMembers = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(userIDs) &&
		isLength(userIDs, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { memberIDs, blockedIDs, validIDs } = groupList(group);

			for (const userID of userIDs) {
				if (
					!isString(userID) ||
					!memberIDs.includes(userID) ||
					!validIDs.includes(id) ||
					blockedIDs.includes(userID)
				) return ErrorMessage.banMembers;
			}

			return true;
		}
	}

	return ErrorMessage.connectRoom;
};

export const blockMembers = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(members) &&
		isLength(members, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { memberIDs, blockedIDs, validIDs } = groupList(group);

			for (const member of members) {
				if (
					!isObject(member) ||
					!isString(member.id) ||
					!isString(member.name) ||
					!memberIDs.includes(member.id) ||
					!validIDs.includes(id) ||
					blockedIDs.includes(member.id)
				) return ErrorMessage.blockMembers;
			}

			return true;
		}
	}

	return ErrorMessage.connectRoom;
};

export const unblockMembers = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(userIDs) &&
		isLength(userIDs, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { blockedIDs, validIDs } = groupList(group);

			for (const userID of userIDs) {
				if (
					!isString(userID) ||
					!validIDs.includes(id) ||
					!blockedIDs.includes(userID)
				) return ErrorMessage.unblockMembers;
			}

			return true;
		}
	}

	return ErrorMessage.connectRoom;
};

export const addMods = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(members) &&
		isLength(members, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { memberIDs, adminID } = groupList(group);

			for (const member of members) {
				if (
					!isObject(member) || 
					!isString(member.id) ||
					!isString(member.name) ||
					id !== adminID ||
					!memberIDs.includes(member.id)
				) return ErrorMessage.addMods;
			}

			return true;
		}
	}

	return ErrorMessage.connectRoom;
};

export const removeMods = async (
	[members, groupID]: [Member[], string],
	{ id, groupRooms }: IUser
) => {
	if (
		isString(groupID) &&
		groupRooms.includes(groupID) &&
		isArray(members) &&
		isLength(members, 0, 2^10)
	) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { modIDs, adminID } = groupList(group);

			for (const member of members) {
				if (
					!isObject(member) ||
					!isString(member.id) ||
					!isString(member.name) ||
					id !== adminID ||
					!modIDs.includes(member.id)
				) return ErrorMessage.removeMods;
			}

			return true;
		}
	}

	return ErrorMessage.connectRoom;
};

export const avatar = async ([avatar]: [string]) => {
	if (isString(avatar)) {
		const group = await Group.findOne({ avatar });
		
		if (group !== null) return true;
	}

	return ErrorMessage.avatar;
};

export const description = ([description]: [string]) => {
	return (isString(description), isLength(description, 0, 420))
		? true
		: ErrorMessage.description;
};

export const state = ([state]: [string]) => {
	const validStates: string[] = Object.values(StateOption);

	return (validStates.includes(state)) ? true : ErrorMessage.state;
};

export const unblock = (
	[{ users, groups }]: [IKeys<string[]>],
	{ blockedUsers, blockedGroups }: IUser
) => {
	if (isArray(users), isArray(groups)) {
		const listUsers = blockedUsers.filter(({ id }) => users.includes(id));
		const listGroups = blockedGroups.filter(({ id }) => groups.includes(id));

		if (listUsers.length === users.length && listGroups.length === groups.length) {
			return true;
		}
	}

	return ErrorMessage.unblock;
};

export const joinRoom = async (
	[{ contactID, roomID, type }]: [IContact],
	{ id, userIDs, userRooms, groupRooms }: IUser
) => {
	if (
		isString(contactID) &&
		isString(roomID) &&
		(
			(type === TypeContact.USER && !userIDs.includes(contactID) && !userRooms.includes(roomID)) ||
			(type === TypeContact.GROUP && !groupRooms.includes(roomID))
		)
	) {
		const match = (type === TypeContact.USER) 
			? await User.findOne({
				_id: id,
				users: { $elemMatch: { userID: contactID, roomID } }
			}) : await Group.findOne({ _id: roomID, members: { $elemMatch: { id } } });

		if (match !== null) return true;
	}

	return ErrorMessage.connectRoom;
};

export const removeRoom = async (
	[id, type]: [string, TypeContact],
	{ userRooms, groupRooms }: IUser
) => {
	const typeContacts = Object.values(TypeContact);

	return (
		isString(id) &&
		(userRooms.includes(id) || groupRooms.includes(id)) &&
		typeContacts.includes(type)
	) ? true : ErrorMessage.removeRoom;
};

export const joinUser = async (
	[userID]: [string],
	{ id, userIDs, blockedUsersIDs }: IUser
) => {
	if (
		isString(userID) &&
		!userIDs.includes(userID) &&
		!blockedUsersIDs.includes(userID)
	) {
		const user = await User
			.findOne({ _id: userID })
			.lean({ virtuals: true });
		
		if (user && !user.blockedUsersIDs.includes(id)) return true;
	}

	return ErrorMessage.connectRoom;
};

export const joinGroup = async (
	[groupID]: [string],
	{ id, groupRooms, blockedGroupsIDs }: IUser
) => {
	if (
		isString(groupID) &&
		!groupRooms.includes(groupID) &&
		!blockedGroupsIDs.includes(groupID)
	) {
		const group = await Group
			.findOne({ _id: groupID })
			.lean({ virtuals: true });
		
		if (group && !group.blockedIDs.includes(id)) return true;
	}

	return ErrorMessage.connectRoom;
};

export const groupInit = async ([group]: [GroupInit], { userIDs }: IUser) => {
	const validStates: string[] = Object.values(StateOption);

	return (
		isObject(group) &&
		isValidKey(Object.keys(group)) &&
		isString(group.name) &&
		validStates.includes(group.state) &&
		group.members instanceof Array &&
		group.mods instanceof Array &&
		await isValidUsers([...group.members, ...group.mods], userIDs)
	) ? true : ErrorMessage.groupInit;
};
