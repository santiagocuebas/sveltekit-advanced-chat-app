import type {
	Contact,
	IForeign,
	IGroup,
	Members,
	IChat
} from '$lib/types/global';
import { socket } from './socket';
import { isMember, isMod } from './services/chat-libs';
import {
	contact,
	switchs,
	groups,
	users,
	user,
	register,
	options
} from './store';
import { Option } from './types/enums';

let contactValue: Contact;
let usersValues: IForeign[];
let groupsValues: IGroup[];

export const unsubContact = contact.subscribe(value => contactValue = value);

export const unsubUsers = users.subscribe(value => usersValues = value as IForeign[]);

export const unsubGroups = groups.subscribe(value => groupsValues = value as IGroup[]);

export const editGroups = (room: string, { content, createdAt }: IChat) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.roomID === room) {
			group.content = content instanceof Array ? content[0] : content;
			group.createdAt = createdAt;
		};

		return group;
	})

	groups.setGroups(reloadGroups);
};

export const leaveUser = (id: string, room: string, remove?: boolean) => {
	const reloadUsers = usersValues.filter(user => user.contactID !== id);
	users.setUsers(reloadUsers);
	switchs.resetOptions();

	if (remove) socket.emit('removeRoom', room, Option.USER);
	if (contactValue.contactID === id) contact.resetContact();
};

export const leaveGroup = (id: string, contactID?: string) => {
	let reloadGroups: IGroup[] = [];

	if (contactValue.contactID === id) {
		reloadGroups = groupsValues.filter(group => group.contactID !== id);
		contact.resetContact();
		switchs.resetOptions();
		socket.emit('removeRoom', id, Option.GROUP);
	} else if (contactID) {
		reloadGroups = groupsValues.map(group => {
			if (group.contactID === id) {
				group.mods = group.mods.filter(({ id }) => id !== contactID);
				group.members = group.members.filter(({ id }) => id !== contactID);
			}

			return group;
		});
		
		options.resetOptions();
	}

	groups.setGroups(reloadGroups);
};

export const addMembers = (id: string, members: Members[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			group.members = [...members, ...group.members];
		}

		return group;
	});

	groups.setGroups(reloadGroups);
	options.resetOptions();
};

export const banMembers = (id: string, banIDs: string[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			group.members = group.members.filter(({ id }) => !banIDs.includes(id));
		}
		
		return group;
	});

	groups.setGroups(reloadGroups);
	options.resetOptions();
};

export const blockMembers = (id: string, blockedUsers: Members[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			const blockedIDs = blockedUsers.map(member => member.id);

			group.members = group.members.filter(({ id }) => !blockedIDs.includes(id));
			group.blacklist = [...blockedUsers, ...group.blacklist];
		}
		
		return group;
	});

	groups.setGroups(reloadGroups);
	options.resetOptions();
};

export const unblockMembers = (id: string, unblockIDs: string[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			group.blacklist = group.blacklist.filter(({ id }) => !unblockIDs.includes(id));
		}
		
		return group;
	});

	groups.setGroups(reloadGroups);
	options.resetOptions();
};

export const addMods = (id: string, mods: Members[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			const modIDs = mods.map(mod => mod.id);

			group.mods = [...mods, ...group.mods];
			group.members = group.members.filter(({ id }) => !modIDs.includes(id));
		}
		
		return group;
	});

	groups.setGroups(reloadGroups);
	options.resetOptions();
};

export const removeMods = (id: string, members: Members[]) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) {
			const modIDs = members.map(members => members.id);

			group.members = [...members, ...group.members];
			group.mods = group.mods.filter(mod => !modIDs.includes(mod.id));
		}
		
		return group;
	});

	groups.setGroups(reloadGroups);
	options.resetOptions();
};

export const changeAvatar = (id: string, avatar: string) => {
	const reloadGroups = groupsValues.map(group => {
		if (group.contactID === id) group.avatar = avatar;
		return group;
	});

	groups.setGroups(reloadGroups);

	if (contactValue.contactID === id) contact.changeAvatar(avatar);
};

export default {
	loggedUser: (id: string, logged: boolean) => {
		const reloadUsers = usersValues.map(user => {
			if (user.contactID === id) {
				user.logged = logged;
			}
	
			return user;
		});
	
		if (contactValue.contactID === id && contactValue.type === Option.USER) {
			contact.changeLogged(logged);
		}
	
		users.setUsers(reloadUsers);
	},
	countMembers: (id: string, num: number) => {
		const reloadGroups = groupsValues.map(group => {
			const allIDs = [...group.mods, ...group.members].map(({ id }) => id);
			allIDs.push(group.admin);

			if (typeof group.logged === 'number' && allIDs.includes(id))
			group.logged = group.logged + num;
	
			return group;
		});
	
		if (
			contactValue.admin === id ||
			isMod(contactValue.mods, id) ||
			isMember(contactValue.members, id)
		) contact.countLogged(num);
	
		groups.setGroups(reloadGroups);
	},
	editUsers: (room: string, { content, createdAt }: IChat) => {
		const reloadUsers = usersValues.map(user => {
			if (user.roomID === room) {
				user.content = content instanceof Array ? content[0] : content;
				user.createdAt = createdAt;
			};
	
			return user;
		});
	
		users.setUsers(reloadUsers);
	},
	editGroups,
	leaveUser,
	leaveGroup,
	addMembers,
	banMembers,
	blockMembers,
	unblockMembers,
	addMods,
	removeMods,
	changeAvatar,
	destroyUser: (id: string) => {
		const reloadGroups = groupsValues.filter(group => {
			if (group.admin !== id) {
				group.mods = group.mods.filter(mod => mod.id !== id);
				group.members = group.members.filter(member => member.id !== id);
	
				return group;
			}
		});
	
		groups.setGroups(reloadGroups);
	
		if (contactValue.admin === id) {
			switchs.resetOptions();
			contact.resetContact();
		}
	},
	connectError: (err: Error) => {
		if (err.message === 'Unauthorized') {
			user.resetUser();
			users.resetContacts();
			groups.resetContacts();
			switchs.resetOptions();
			register.setOption(Option.SIGNIN);
		}
	}
};
