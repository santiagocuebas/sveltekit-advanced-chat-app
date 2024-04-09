import type {
	Contacts,
	IChat,
	IContacts,
	IForeign,
	IGroup,
	Member
} from "$lib/types/global";
import { writable } from "svelte/store";
import { contact, options } from "./index";
import { getUrl } from "$lib/services";
import { socket } from "$lib/socket";
import { Option } from "$lib/types/enums";

function createContacts(contacts: IContacts) {
	const { subscribe, update, set } = writable(contacts);

	return {
		subscribe,
		loggedUser: (id: string, logged: boolean) => update(contacts => {
			contacts.users = contacts.users.map(user => {
				if (user.contactID === id) user.logged = logged;
		
				return user;
			});

			contact.updateUser();
			return contacts;
		}),
		countUser: (id: string) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.allIDs.includes(id) && !group.logged.includes(id)) {
					group.logged = [id, ...group.logged];
				}
		
				return group;
			});

			contact.updateUser();
			return contacts;
		}),
		discountUser: (id: string) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.allIDs.includes(id) && group.logged.includes(id)) {
					group.logged = group.logged.filter(userID => userID !== id);
				}
		
				return group;
			});

			contact.updateUser();
			return contacts;
		}),
		countMembers: (id: string, loggedUsers: string[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) group.logged = [...loggedUsers, ...group.logged];
		
				return group;
			});

			contact.updateUser();
			return contacts;
		}),
		discountMembers: (id: string, loggedUsers: string[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					group.logged = group.logged.filter(id => !loggedUsers.includes(id));
				}
		
				return group;
			});

			contact.updateUser();
			return contacts;
		}),
		editUsers: (room: string, { to, content, createdAt }: IChat) => update(contacts => {
			contacts.users = contacts.users.map(user => {
				if (user.contactID !== to && user.roomID === room) {
					user.content = content instanceof Array ? getUrl(content[0]) : content;
					user.createdAt = createdAt;
				}
		
				return user;
			});
		
			return contacts;
		}),
		editGroups: (room: string, { content, createdAt }: IChat) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.roomID === room) {
					group.content = content instanceof Array ? getUrl(content[0]) : content;
					group.createdAt = createdAt;
				}
		
				return group;
			});

			return contacts;
		}),
		leaveUser: (id: string, room?: string) => update(contacts => {
			if (room) socket.emit('removeRoom', room, Option.USER);
			contact.resetContactWithId(id);

			return {
				...contacts,
				users: contacts.users.filter(user => user.contactID !== id)
			};
		}),
		leaveGroup: (id: string) => update(contacts => {
			socket.emit('removeRoom', id, Option.GROUP);
			contact.resetContactWithId(id);

			return {
				...contacts,
				groups: contacts.groups.filter(user => user.contactID !== id)
			};
		}),
		addMembers: (id: string, members: Member[], loggedUsers?: string[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					group.members = [...members, ...group.members];

					if (loggedUsers) group.logged = [...loggedUsers, ...group.logged];
				}
				
				return group;
			});

			contact.updateUser();
			options.resetOptions();
			return contacts;
		}),
		banMembers: (id: string, banIDs: string[], loggedUsers?: string[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					group.members = group.members.filter(({ id }) => !banIDs.includes(id));

					if (loggedUsers) group.logged = group.logged.filter(id => !loggedUsers.includes(id));
				}
			
				return group;
			});

			contact.updateUser();
			options.resetOptions();
			return contacts;
		}),
		blockMembers: (id: string, blockedUsers: Member[], loggedUsers?: string[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					const blockedIDs = blockedUsers.map(member => member.id);

					group.members = group.members.filter(({ id }) => !blockedIDs.includes(id));
					group.blacklist = [...blockedUsers, ...group.blacklist];

					if (loggedUsers) group.logged = group.logged.filter(id => !loggedUsers.includes(id));
				}
				
				return group;
			});

			contact.updateUser();
			options.resetOptions();
			return contacts;
		}),
		unblockMembers: (id: string, unblockIDs: string[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					group.blacklist = group.blacklist.filter(({ id }) => !unblockIDs.includes(id));
				}
			
				return group;
			});

			options.resetOptions();
			return contacts;
		}),
		addMods: (id: string, mods: Member[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					const modIDs = mods.map(mod => mod.id);

					group.mods = [...mods, ...group.mods];
					group.members = group.members.filter(({ id }) => !modIDs.includes(id));
				}
				
				return group;
			});

			options.resetOptions();
			return contacts;
		}),
		removeMods: (id: string, members: Member[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					const modIDs = members.map(members => members.id);

					group.members = [...members, ...group.members];
					group.mods = group.mods.filter(mod => !modIDs.includes(mod.id));
				}
				
				return group;
			});

			options.resetOptions();
			return contacts;
		}),
		changeAvatar: (id: string, avatar: string) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) group.avatar = avatar;

				return group;
			});

			contact.updateUser();
			return contacts;
		}),
		changeDescription: (id: string, description: string) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) group.description = description;

				return group;
			});

			return contacts;
		}),
		changeState: (id: string, state: string) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) group.state = state;

				return group;
			});

			return contacts;
		}),
		destroyUser: (id: string) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.admin !== id) {
					group.mods = group.mods.filter(mod => mod.id !== id);
					group.members = group.members.filter(member => member.id !== id);
				}

				return group;
			});

			contact.destroyIfAdmin(id);
			return contacts;
		}),
		setContacts: ({ users, groups }: Contacts) => update(contacts => {
			return { ...contacts, users, groups };
		}),
		addContact: (contact: IForeign) => update(contacts => {
			return { ...contacts, users: [contact, ...contacts.users] };
		}),
		addGroup: (contact: IGroup) => update(contacts => {
			return { ...contacts, groups: [contact, ...contacts.groups] };
		}),
		resetContacts: () => set({ users: [], groups: [] })
	}
}

export const contacts = createContacts({ users: [], groups: [] });
