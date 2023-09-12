import type { Blacklist, IUser } from "$lib/types/global";
import { writable } from "svelte/store";

function createUser() {
	const { subscribe, update, set } = writable({ } as IUser);

	return {
		subscribe,
		unblockUser: (value: string[]) => update(user => {
			user.blacklist.filter(({ id }) => !value.includes(id));

			return user;
		}),
		updateProp: (value: string, prop: 'username' | 'description' | 'avatar') => update(user => {
			user[prop] = value;

			return user;
		}),
		updateBlock: (value: Blacklist) => update(user => {
			user.blacklist.push(value);

			return user;
		}),
		setUser: (value: IUser) => set(value),
		resetUser: () => set({ } as IUser)
	}
}

export const user = createUser();
