import type { IChat, IContact, Members } from '$lib/types/global';
import { TypeContact } from './types/enums';
import { socket } from './socket';
import { isMember, isMod } from './services/chat-libs';
import { contact, switchs, groups, users, user, register } from './store';
import { onDestroy } from 'svelte';

let contactValue: IContact;
let usersValues: IContact[];
let groupsValues: IContact[];

const unsubContact = contact.subscribe(value => contactValue = value);
const unsubUsers = users.subscribe(value => usersValues = value as IContact[]);
const unsubGroups = groups.subscribe(value => groupsValues = value as IContact[]);

export const loggedUser = (id: string, logged: boolean) => {
	const reloadUsers = usersValues.map(user => {
		if (user.contactID === id) {
			user.logged = logged;
		}

		return user;
	});

	if (contactValue.contactID === id && contactValue.type === TypeContact.USER) {
		contact.changeLogged(logged);
	}

	users.setContacts(reloadUsers);
};

export const countMembers = (id: string, num: number) => {
	const reloadGroups = groupsValues.map(group => {
		if (typeof group.logged === 'number' && group.contactID === id)
		group.logged = group.logged + num;

		return group;
	});

	if (
		contactValue.admin === id ||
		isMod(contactValue.mods, id) ||
		isMember(contactValue.members, id)
	) contact.countLogged(num);

	groups.setContacts(reloadGroups);
};

export const editUsers = (room: string, { content, createdAt }: IChat) => {
	const reloadUsers = usersValues.map(user => {
		if (user.roomID === room) {
			user.content = content instanceof Array ? content[0] : content;
			user.createdAt = createdAt;
		};

		return user;
	});

	users.setContacts(reloadUsers);
};

export const editGroups = (room: string, { content, createdAt }: IChat) => {
	const reloadUsers = groupsValues.map(group => {
		if (group.roomID === room) {
			group.content = content instanceof Array ? content[0] : content;
			group.createdAt = createdAt;
		};

		return group;
	})

	groups.setContacts(reloadUsers);
};

export const leaveUser = (id: string, room: string, remove?: boolean) => {
	const reloadUsers = usersValues.filter(user => user.contactID !== id);
	users.setContacts(reloadUsers);
	switchs.resetOptions();

	if (remove) socket.emit('removeRoom', room, TypeContact.USER);
	if (contactValue.contactID === id) contact.resetContact();
};

export const leaveGroup = (id: string, remove?: boolean) => {
	const reloadGroups = groupsValues.filter(group => group.contactID !== id);
	groups.setContacts(reloadGroups);
	switchs.resetOptions();

	if (remove) socket.emit('removeRoom', id, TypeContact.GROUP);
	if (contactValue.contactID === id) contact.resetContact();
};

export const addMembers = (id: string, members: Members[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			if (group.members) group.members = [...members, ...group.members];
		}

		return group;
	});

	groups.setContacts(reloadGroups);
};

export const banMembers = (id: string, banIDs: string[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			if (group.members) group.members = group.members = group.members.filter(member => !banIDs.includes(member.id));
		}
		
		return group;
	});

	groups.setContacts(reloadGroups);
};

export const blockMembers = (id: string, blockedUsers: Members[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			const blockedIDs = blockedUsers.map(member => member.id);

			if (group.members) group.members = group.members.filter(member => !blockedIDs.includes(member.id));
			if (group.blacklist) group.blacklist = [...blockedUsers, ...group.blacklist];
		}
		
		return group;
	});

	groups.setContacts(reloadGroups);
};

export const unblockMembers = (id: string, unblockIDs: string[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			if (group.blacklist) group.blacklist = group.blacklist.filter(member => !unblockIDs.includes(member.id));
		}
		
		return group;
	});

	groups.setContacts(reloadGroups);
};

export const addMods = (id: string, mods: Members[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			const modIDs = mods.map(mod => mod.id);

			if (group.mods) group.mods = [...mods, ...group.mods];
			if (group.members) group.members = group.members.filter(member => !modIDs.includes(member.id));
		}
		
		return group;
	});

	groups.setContacts(reloadGroups);
};

export const removeMods = (id: string, mods: Members[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			const modIDs = mods.map(mod => mod.id);

			if (group.members) group.members = [...mods, ...group.members];
			if (group.mods) group.mods = group.mods.filter(mod => !modIDs.includes(mod.id));
		}
		
		return group;
	});

	groups.setContacts(reloadGroups);
};

export const changeAvatar = (id: string, avatar: string) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) group.avatar = avatar;
		return group;
	});

	groups.setContacts(reloadGroups);

	if (contactValue.contactID === id) contact.changeAvatar(avatar);
};

export const destroyUser = (id: string) => {
	const reloadGroups: IContact[] = [];

	for (const group of groupsValues) {
		if (group.admin && group.admin !== id) {
			if (group.mods) group.mods = group.mods.filter(mod => mod.id !== id);
			if (group.members) group.members = group.members.filter(member => member.id !== id);

			reloadGroups.push(group);
		}
	}

	groups.setContacts(reloadGroups);

	if (contactValue.admin === id) contact.resetContact();
};

export const connectError = (err: Error) => {
	if (err.message === 'Unauthorized') {
		user.resetUser();
		users.resetContacts();
		groups.resetContacts();
		switchs.resetOptions();
		register.setOption('signin');
	}
};

onDestroy(() => {
	return {
		unsubContact,
		unsubUsers,
		unsubGroups
	}
});
