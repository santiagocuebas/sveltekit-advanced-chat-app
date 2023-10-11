import type {
	Contact,
	IForeign,
	IGroup,
	Member,
	IChat
} from '$lib/types/global';
import { socket } from './socket';
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
	groupsValues = groupsValues.map(group => {
		if (group.roomID === room) {
			group.content = content instanceof Array ? content[0] : content;
			group.createdAt = createdAt;
		};

		return group;
	})

	groups.setGroups(groupsValues);
};

export const leaveUser = (id: string, room: string, remove?: boolean) => {
	usersValues = usersValues.filter(user => user.contactID !== id);
	users.setUsers(usersValues);
	switchs.resetOptions();

	if (remove) socket.emit('removeRoom', room, Option.USER);
	if (contactValue.contactID === id) contact.resetContact();
};

export const leaveGroup = (id: string) => {
	groupsValues = groupsValues.filter(group => group.contactID !== id);

	groups.setGroups(groupsValues);
	options.resetOptions();

	if (contactValue.contactID === id) {
		contact.resetContact();
		switchs.resetOptions();
		socket.emit('removeRoom', id, Option.GROUP);
	}
};

export const addMembers = (id: string, ...members: Member[]) => {
	groupsValues = groupsValues.map(group => {
		if (group.contactID === id) {
			group.members = [...members, ...group.members];
		}
	
		return group;
	});

	groups.setGroups(groupsValues);
	options.resetOptions();
};

export const banMembers = (id: string, ...banIDs: string[]) => {
	groupsValues = groupsValues.map(group => {
		if (group.contactID === id) {
			group.members = group.members.filter(({ id }) => !banIDs.includes(id));
		}
		
		return group;
	});

	groups.setGroups(groupsValues);
	options.resetOptions();
};

export const blockMembers = (id: string, ...blockedUsers: Member[]) => {
	groupsValues = groupsValues.map(group => {
		if (group.contactID === id) {
			const blockedIDs = blockedUsers.map(member => member.id);

			group.members = group.members.filter(({ id }) => !blockedIDs.includes(id));
			group.blacklist = [...blockedUsers, ...group.blacklist];
		}
		
		return group;
	});

	groups.setGroups(groupsValues);
	options.resetOptions();
};

export const unblockMembers = (id: string, ...unblockIDs: string[]) => {
	groupsValues = groupsValues.map(group => {
		if (group.contactID === id) {
			group.blacklist = group.blacklist.filter(({ id }) => !unblockIDs.includes(id));
		}
		
		return group;
	});

	groups.setGroups(groupsValues);
	options.resetOptions();
};

export const addMods = (id: string, ...mods: Member[]) => {
	console.log(mods)
	groupsValues = groupsValues.map(group => {
		if (group.contactID === id) {
			const modIDs = mods.map(mod => mod.id);

			group.mods = [...mods, ...group.mods];
			group.members = group.members.filter(({ id }) => !modIDs.includes(id));
		}
		
		return group;
	});

	groups.setGroups(groupsValues);
	options.resetOptions();
};

export const removeMods = (id: string, ...members: Member[]) => {
	groupsValues = groupsValues.map(group => {
		if (group.contactID === id) {
			const modIDs = members.map(members => members.id);

			group.members = [...members, ...group.members];
			group.mods = group.mods.filter(mod => !modIDs.includes(mod.id));
		}
		
		return group;
	});

	groups.setGroups(groupsValues);
	options.resetOptions();
};

export const changeAvatar = (id: string, avatar: string) => {
	groupsValues = groupsValues.map(group => {
		if (group.contactID === id) group.avatar = avatar;
		return group;
	});

	groups.setGroups(groupsValues);

	if (contactValue.contactID === id) contact.changeAvatar(avatar);
};

export default {
	loggedUser: (id: string, logged: boolean) => {
		usersValues = usersValues.map(user => {
			if (user.contactID === id) {
				user.logged = logged;
			}
	
			return user;
		});
	
		if (contactValue.contactID === id && contactValue.type === Option.USER) {
			contact.changeLogged(logged);
		}
	
		users.setUsers(usersValues);
	},
	countMembers: (id: string, num: number, member?: Member) => {
		groupsValues = groupsValues.map(group => {
			const allIDs = [...group.mods, ...group.members].map(({ id }) => id);
			allIDs.push(group.admin);

			if (typeof group.logged === 'number' && allIDs.includes(id)) {
				group.logged = group.logged + num;
				if (member) group.members.push(member);
			}
	
			return group;
		});
	
		if (contactValue.contactID === id) contact.countLogged(num);
	
		groups.setGroups(groupsValues);
	},
	editUsers: (room: string, { content, createdAt }: IChat) => {
		usersValues = usersValues.map(user => {
			if (user.roomID === room) {
				user.content = content instanceof Array ? content[0] : content;
				user.createdAt = createdAt;
			};
	
			return user;
		});
	
		users.setUsers(usersValues);
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
		groupsValues = groupsValues.filter(group => {
			if (group.admin !== id) {
				group.mods = group.mods.filter(mod => mod.id !== id);
				group.members = group.members.filter(member => member.id !== id);
	
				return group;
			}
		});
	
		groups.setGroups(groupsValues);
	
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
