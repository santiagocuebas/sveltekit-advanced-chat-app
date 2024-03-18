import type {
	Contact,
	Contacts,
	IChat,
	IContacts,
	IList,
	Member
} from "$lib/types/global";
import { writable } from "svelte/store";
import { contact, options } from "./index";
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

			contact.changeLogged(id, logged);
			return contacts;
		}),
		countMembers: (id: string, num: number, member?: Member) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				const allIDs = [...group.mods, ...group.members].map(({ id }) => id);
				allIDs.push(group.admin);

				if (typeof group.logged === 'number' && allIDs.includes(id)) {
					group.logged = group.logged + num;
					if (member) group.members.push(member);
				}
		
				return group;
			});

			contact.countLogged(id, num);
			return contacts;
		}),
		editUsers: (room: string, { content, createdAt }: IChat) => update(contacts => {
			contacts.users = contacts.users.map(user => {
				if (user.roomID === room) {
					user.content = content instanceof Array ? content[0] : content;
					user.createdAt = createdAt;
				}
		
				return user;
			});
		
			return contacts;
		}),
		editGroups: (room: string, { content, createdAt }: IChat) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.roomID === room) {
					group.content = content instanceof Array ? content[0] : content;
					group.createdAt = createdAt;
				}
		
				return group;
			});

			return contacts;
		}),
		leaveUser: (id: string, room: string, remove?: boolean) => update(contacts => {
			if (remove) socket.emit('removeRoom', room, Option.USER);
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
		addMembers: (id: string, ...members: Member[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) group.members = [...members, ...group.members];
				
				return group;
			});

			options.resetOptions();
			return contacts;
		}),
		banMembers: (id: string, ...banIDs: string[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					group.members = group.members.filter(({ id }) => !banIDs.includes(id));
				}
			
				return group;
			});

			options.resetOptions();
			return contacts;
		}),
		blockMembers: (id: string, ...blockedUsers: Member[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					const blockedIDs = blockedUsers.map(member => member.id);

					group.members = group.members.filter(({ id }) => !blockedIDs.includes(id));
					group.blacklist = [...blockedUsers, ...group.blacklist];
				}
				
				return group;
			});

			options.resetOptions();
			return contacts;
		}),
		unblockMembers: (id: string, ...unblockIDs: string[]) => update(contacts => {
			contacts.groups = contacts.groups.map(group => {
				if (group.contactID === id) {
					group.blacklist = group.blacklist.filter(({ id }) => !unblockIDs.includes(id));
				}
			
				return group;
			});

			options.resetOptions();
			return contacts;
		}),
		addMods: (id: string, ...mods: Member[]) => update(contacts => {
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
		removeMods: (id: string, ...members: Member[]) => update(contacts => {
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

			contact.changeAvatar(id, avatar);
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
		addContact: (contact: Contact) => update(contacts => {
			return { ...contacts, users: [contact, ...contacts.users] };
		}),
		addGroup: (contact: Contact) => update(contacts => {
			return { ...contacts, groups: [contact, ...contacts.groups] };
		}),
		setLists: (list: IList[]) => update(contacts => {
			return { ...contacts, list };
		}),
		removeItem: (contactID: string) => update(contacts => {
			return {
				...contacts,
				list: contacts.list.filter(item => item.contactID !== contactID)
			};
		}),
		resetList: () => update(contacts => {
			return { ...contacts, list: [] };
		}),
		resetContacts: () => set({ users: [], groups: [], list: [] })
	}
}

export const contacts = createContacts({
	users: [],
	groups: [],
	list: []
});
