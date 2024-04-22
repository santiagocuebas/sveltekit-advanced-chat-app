import type { Contact, IChat, IForeign, IUser, Member } from "$lib/types/global";
import { getId } from "./libs";
import { Option } from "$lib/types/enums";

export const getChat = (
	user: IUser,
	contact: Contact,
	message: string | string[]
): IChat => {
	return {
		_id: getId(),
		from: user.id ?? '',
		to: contact.contactID,
		username: contact.type === Option.GROUP ? user.username : undefined,
		type: contact.type,
		content: message,
		createdAt: Date()
	}
};

export const isNotMember = (users: IForeign[], contact: Contact | null) => {
	const newMembers: Member[] = [];
	
	if (contact !== null) {
		const allIDs = [...contact.mods, ...contact.members, ...contact.blacklist].map(({ id }) => id);
		if (contact.admin) allIDs.push(contact.admin);

		for (const { contactID, name, blockedIDs } of users) {
			if (!allIDs.includes(contactID) && !blockedIDs?.includes(contact.contactID)) {
				newMembers.push({ id: contactID, name });
			}
		}
	}

	return newMembers;
};

export const addMember = (member: Member, members: Member[]): Member[] => {
	return !isMember(members, member.id)
		? [member, ...members]
		: members.filter(user => user.id !== member.id);
};

export const banMember = (id: string, banIDs: string[]): string[] => {
	return !banIDs.includes(id)
		? [id, ...banIDs]
		: banIDs.filter(banID => banID !== id);
};

export const isMod = (mods: Member[] | undefined, id = '') => {
	return mods
		?.map(({ id }) => id)
		.includes(id);
};

export const isMember = (members: Member[] | undefined, id = '') => {
	return members
		?.map(({ id }) => id)
		.includes(id);
};
