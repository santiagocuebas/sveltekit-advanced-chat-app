import type { IForeign, IGroup, IList } from "$lib/types/global";
import { writable } from "svelte/store";

function createContacts(contacts: IForeign[] | IGroup[] | IList[]) {
	const { subscribe, set } = writable(contacts);

	return {
		subscribe,
		setUsers: (value: IForeign[]) => set(value),
		setGroups: (value: IGroup[]) => set(value),
		setLists: (value: IList[]) => set(value),
		resetContacts: () => set([])
	}
}

export const list = createContacts([]);

export const users = createContacts([]);

export const groups = createContacts([]);
