import type { Contact } from "$lib/types/global";
import { goto } from "$app/navigation";
import { writable } from "svelte/store";
import { groupProps } from "./index";
import { Option } from "$lib/types/enums";

function createContact() {
	const { subscribe, update, set } = writable({ } as Contact);

	return {
		subscribe,
		changeLogged: (id: string, logged: boolean) => update(contact => {
			if (contact.contactID === id && contact.type === Option.USER) {
				contact.logged = logged;
			}

			return contact;
		}),
		countLogged: (id: string, num: number) => update(contact => {
			if (contact.contactID === id && typeof contact.logged === 'number') {
				contact.logged = contact.logged + num;
			}

			return contact;
		}),
		changeAvatar: (id: string, avatar: string) => update(contact => {
			if (contact.contactID === id) contact.avatar = avatar;

			return contact;
		}),
		resetContactWithId: (id: string) => update(contact => {
			if (contact.contactID === id) {
				contact = { } as Contact;
				goto('/');
			}

			return contact;
		}),
		destroyIfAdmin: (id: string) => update(contact => {
			if (contact.admin === id) {
				goto('/');
				contact = { } as Contact;
			}
			
			return contact;
		}),
		setContact: (value: Contact) => set(value),
		resetContact: () => {
			groupProps.resetProps();
			set({ } as Contact);
		}
	}
}

export const contact = createContact();
