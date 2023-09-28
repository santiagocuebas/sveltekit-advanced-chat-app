import type { IForeign, IGroup, IList } from "$lib/types/global";
import { writable } from "svelte/store";

function createContacts(contacts: IForeign[] | IGroup[] | IList[]) {
	const { subscribe, update, set } = writable(contacts);

	return {
		subscribe,
		setUsers: (value: IForeign[]) => update(contacts => {
			contacts = value;
			return contacts;
		}),
		setGroups: (value: IGroup[]) => update(contacts => {
			contacts = value;
			return contacts;
		}),
		setLists: (value: IList[]) => update(contacts => {
			contacts = value;
			return contacts;
		}),
		resetContacts: () => set([])
	}
}

export const list = createContacts([]);

export const users = createContacts([]);

export const groups = createContacts([]);
