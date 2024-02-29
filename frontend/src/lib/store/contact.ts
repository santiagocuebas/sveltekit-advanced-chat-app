import type { Contact } from "$lib/types/global";
import { writable } from "svelte/store";

function createContact() {
	const { subscribe, update, set } = writable({ } as Contact);

	return {
		subscribe,
		changeLogged: (log: number | boolean) => update(contact => {
			return {
				...contact,
				logged: (typeof contact.logged === 'number' && typeof log === 'number')
					? contact.logged + log
					: log
			};
		}),
		changeAvatar: (avatar: string) => update(contact => {
			return { ...contact, avatar };
		}),
		setContact: (contact: Contact) => set(contact),
		resetContact: () => set({ } as Contact)
	}
}

export const contact = createContact();
