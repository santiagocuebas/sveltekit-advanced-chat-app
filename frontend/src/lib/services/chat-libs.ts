import type { Contact, IForeign, IGroup, IUser, Member } from "$lib/types/global";
import { getId } from "./libs";
import { Option } from "$lib/types/enums";

export const getChat = (user: IUser, contact: Contact, message: string | string[]) => {
	return {
		_id: getId(),
		from: user.id,
		to: contact.contactID,
		username: contact.type === Option.GROUP ? user.username : undefined,
		content: message,
		createdAt: Date()
	}
};

export const isNotMember = (
	users: IForeign[],
	{ contactID, admin, mods, members, blacklist }: IGroup
) => {
	const newMembers: Member[] = [];
	const id = contactID;
	const allIDs = [...mods, ...members, ...blacklist].map(({ id }) => id);
	if (admin) allIDs.push(admin);

	for (const { contactID, name, blockedIDs } of users) {
		if (!allIDs.includes(contactID) && !blockedIDs?.includes(id)) {
			newMembers.push({ id: contactID, name });
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

export const isMod = (mods: Member[], id: string) => {
	return mods
		?.map(({ id }) => id)
		.includes(id);
};

export const isMember = (members: Member[], id: string) => {
	return members
		?.map(({ id }) => id)
		.includes(id);
};
