import type { IUser, Members } from '../types/global.js';
import type { GroupInit, IKeys } from '../types/types.js';
import {
	existsImage,
	groupList,
	isArray,
	isLength,
	isObject,
	isString,
	isValidKey,
	isValidUsers
} from './socket-custom.js';
import { Chat, Group, User } from '../models/index.js';
import { StateOption } from '../types/enums.js';

export const joinUserRoom = (
	[contactID, roomID]: [string, string],
	{ id, userIDs, userRooms }: IUser
) => {
	if (
		isString(contactID) &&
		isString(roomID) &&
		userIDs.includes(contactID) &&
		userRooms.includes(roomID) &&
		(contactID + id === roomID || id + contactID === roomID)
	) return true;

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const joinGroupRoom = ([contactID]: [string], { groupRooms }: IUser) => {
	if (isString(contactID) && groupRooms.includes(contactID)) return true;

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const createChat = async ([chat, tempID]: [string & string[], string]) => {
	if (isString(tempID)) {
		if (isString(chat) && isLength(chat, 0, 420)) return true;
		if (isArray(chat) && isLength(chat, 0, 3) && await existsImage(chat)) return true;
	}

	return {
		error: 'Chat Error',
		message: 'The chat content is invalid'
	};
};

export const deleteChat = async ([id]: [string]) => {
	if (isString(id)) {
		const chat = await Chat.findOne({ _id: id });

		if (chat !== null) return true;
	}

	return {
		error: 'Chat Error',
		message: 'The id is invalid'
	};
};

export const blockGroup = ([name]: [string]) => {
	if (isString(name) && isLength(name, 3, 40)) return true;

	return {
		error: 'Group Error',
		message: 'The id or name is invalid'
	};
};

export const addMembers = async (
	[members, groupID]: [Members[], string],
	{ id, groupRooms }: IUser
) => {
	if (isString(groupID) && groupRooms.includes(groupID) && isArray(members)) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { allIDs, validIDs } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const member of members) {
				if (
					!isObject(member) ||
					!isString(member.id) ||
					!isString(member.name) ||
					allIDs.includes(member.id) ||
					!validIDs.includes(id) ||
					!(await User.findOne({ _id: member.id, username: member.name }))
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying to join the user'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const banMembers = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	if (isString(groupID) && groupRooms.includes(groupID) && isArray(userIDs)) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { memberIDs, blockedIDs, validIDs } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const userID of userIDs) {
				if (
					!isString(userID) ||
					!memberIDs.includes(userID) ||
					!validIDs.includes(id) ||
					blockedIDs.includes(userID)
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying ban the user'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const blockMembers = async (
	[members, groupID]: [Members[], string],
	{ id, groupRooms }: IUser
) => {
	if (isString(groupID) && groupRooms.includes(groupID) && isArray(members)) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { memberIDs, blockedIDs, validIDs } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const member of members) {
				if (
					!isObject(member) ||
					!isString(member.id) ||
					!isString(member.name) ||
					!memberIDs.includes(member.id) ||
					!validIDs.includes(id) ||
					blockedIDs.includes(member.id)
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying block the user'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const unblockMembers = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	if (isString(groupID) && groupRooms.includes(groupID) && isArray(userIDs)) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { blockedIDs, validIDs } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const userID of userIDs) {
				if (
					!isString(userID) ||
					!validIDs.includes(id) ||
					!blockedIDs.includes(userID)
				) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying unblocking the user'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const addMods = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	if (isString(groupID) && groupRooms.includes(groupID) && isArray(userIDs)) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { memberIDs, adminID } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const userID of userIDs) {
				if (!isString(userID) || id !== adminID || !memberIDs.includes(userID)) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying add the mod'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const removeMods = async (
	[userIDs, groupID]: [string[], string],
	{ id, groupRooms }: IUser
) => {
	if (isString(groupID) && groupRooms.includes(groupID) && isArray(userIDs)) {
		const group = await Group.findOne({ _id: groupID });

		if (group !== null) {
			const { modIDs, adminID } = groupList(group);
			let match: boolean | IKeys<string> = true;

			for (const userID of userIDs) {
				if (!isString(userID) || id !== adminID || !modIDs.includes(userID)) {
					match = {
						error: 'Group Error',
						message: 'An error occurred while trying remove the mod'
					};

					break;
				}
			}

			return match;
		}
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const avatar = async ([avatar]: [string]) => {
	if (isString(avatar)) {
		const group = await Group.findOne({ avatar });
		
		if (group !== null) return true;
	}

	return {
		error: 'Avatar Error',
		message: 'The avatar is invalid'
	};
};

export const description = ([description]: [string]) => {
	if (isString(description), isLength(description, 0, 420)) return true;

	return {
		error: 'Description Error',
		message: 'The description is invalid'
	};
};

export const state = ([state]: [string]) => {
	const validStates: string[] = Object.values(StateOption);
	if (validStates.includes(state)) return true;

	return {
		error: 'State Error',
		message: 'The state is invalid'
	};
};

export const joinRoom = async (
	[id]: [string],
	{ userRooms, groupRooms }: IUser
) => {
	if (isString(id) && (userRooms.includes(id) || groupRooms.includes(id))) {
		return true;
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const removeRoom = async (
	[id]: [string],
	{ userRooms, groupRooms }: IUser
) => {
	if (isString(id) && (userRooms.includes(id) || groupRooms.includes(id))) {
		return true;
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying delete to room'
	};
};

export const joinUser = async ([id]: [string]) => {
	if (isString(id) && await User.findOne({ _id: id })) {
		return true;
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const joinGroup = async ([id]: [string]) => {
	if (isString(id) && await Group.findOne({ _id: id })) {
		return true;
	}

	return {
		error: 'Join Error',
		message: 'An error occurred while trying to join'
	};
};

export const groupInit = async ([group]: [GroupInit], { userIDs }: IUser) => {
	const validStates: string[] = Object.values(StateOption);

	if (
		isObject(group) &&
		isValidKey(Object.keys(group)) &&
		isString(group.name) &&
		validStates.includes(group.state) &&
		group.members instanceof Array &&
		group.mods instanceof Array &&
		await isValidUsers([...group.members, ...group.mods], userIDs)
	) {
		return true;
	}

	return {
		error: 'Group Error',
		message: 'An error occurred while trying to create the group'
	};
};
