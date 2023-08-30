import type { IContact } from "$lib/global";
import { writable } from "svelte/store";

function createContact() {
	const { subscribe, update, set } = writable({ } as IContact);

	return {
		subscribe,
		changeLogged: (log: boolean) => update(value => {
			value.logged = log;

			return value;
		}),
		countLogged: (num: number) => update(value => {
			if (typeof value.logged === 'number') value.logged = value.logged + num;

			return value;
		}),
		changeAvatar: (avatar: string) => update(value => {
			value.avatar = avatar;

			return value;
		}),
		setContact: (value: IContact) => set(value),
		resetContact: () => set({ } as IContact)
	}
}

export const contact = createContact();
