import type { IList, IContact } from "$lib/global";
import { writable } from "svelte/store";

function createContacts(initContacts: IContact[] | IList[]) {
	const { subscribe, set } = writable(initContacts);

	 return {
		subscribe,
		setContacts: (list: IContact[] | IList[]) => set(list),
		resetContacts: () => set([] as IContact[] | IList[])
	 }
}

export const list = createContacts([]);

export const users = createContacts([]);

export const groups = createContacts([]);
