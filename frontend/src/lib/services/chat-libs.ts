import type {
	Contact,
	IForeign,
	IGroup,
	IGroupProps,
	IUser,
	Member
} from "$lib/types/global";
import { Option } from "$lib/types/enums";
import { getId } from "./libs";

export const setGroupProps = ({ description, state }: IGroup): IGroupProps => {
	return {
		add: [],
		ban: [],
		block: [],
		unblock: [],
		addMod: [],
		removeMod: [],
		description: description,
		state: state,
		destroy: undefined
	}
};

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
		if (!allIDs.includes(contactID) && !blockedIDs.includes(id)) {
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

export const banMember = ({ id }: Member, banIDs: string[]): string[] => {
	return !banIDs.includes(id)
		? [id, ...banIDs]
		: banIDs.filter(banID => banID !== id);
};

export const isMod = (mods: Member[], id: string) => {
	return mods
		?.map(({ id }) => id)
		.includes(id);
};

export const isMember = (member: Member[], id: string) => {
	return member
		?.map(({ id }) => id)
		.includes(id);
};
