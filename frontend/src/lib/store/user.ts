import type { Members, IUser, RawUser, IKeys } from "$lib/types/global";
import { writable } from "svelte/store";

function createUser() {
	const { subscribe, update, set } = writable({ } as IUser);

	return {
		subscribe,
		updateProp: (key: string, value: string | IKeys<string[]>) => update(user => {
			if (typeof value === 'object') {
				user.blocked.users = user.blocked.users.filter(({ id }) => !value.users.includes(id));
				user.blocked.groups = user.blocked.groups.filter(({ id }) => !value.groups.includes(id));
			} else if (typeof value === 'string') user[key] = value;
	
			return user;
		}),
		blockContact: (value: Members, prop: string) => update(user => {
			user.blocked[prop].push(value);

			return user;
		}),
		setUser: (value: RawUser) => {
			const user: IUser = {
				id: value.id,
        username: value.username,
        avatar: value.avatar,
        description: value.description,
        blocked: {
					users: value.blockedUsers,
          groups: value.blockedGroups
				}
			};

			set(user);
		},
		resetUser: () => set({ } as IUser)
	}
}

export const user = createUser();
