import type { Contact } from "$lib/types/global";
import { goto } from "$app/navigation";
import { writable } from "svelte/store";
import { groupProps } from "./index";

function createContact(data: Contact | null) {
	const { subscribe, update, set } = writable(data);

	return {
		subscribe,
		updateUser: () => update(contact => {
			if (contact) {
				contact.logged = contact.logged;
				contact.avatar = contact.avatar;
			}

			return contact;
		}),
		resetContactWithId: (id: string) => update(contact => {
			if (contact?.contactID === id) {
				goto('/');
				contact = null;
			}

			return contact;
		}),
		destroyIfAdmin: (id: string) => update(contact => {
			if (contact?.admin === id) {
				goto('/');
				contact = null;
			}
			
			return contact;
		}),
		setContact: (value: Contact) => set(value),
		resetContact: () => {
			groupProps.resetProps();
			set(null);
		}
	}
}

export const contact = createContact(null);
