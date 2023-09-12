import type { IList, IContact } from "$lib/types/global";
import { writable } from "svelte/store";

function createContacts(contacts: IContact[] | IList[]) {
	const { subscribe, update, set } = writable(contacts);

	return {
		subscribe,
		setContacts: (value: IContact[] | IList[]) => update(contacts => {
			contacts = value;
			return contacts;
		}),
		resetContacts: () => set([])
	}
}

export const list = createContacts([]);

export const users = createContacts([]);

export const groups = createContacts([]);
