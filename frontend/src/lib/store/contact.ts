import type { Contact } from "$lib/types/global";
import { goto } from "$app/navigation";
import { writable } from "svelte/store";
import { groupProps, options } from "./index";
import { socket } from "$lib/socket";

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
		resetContactWithId: (roomID: string) => update(contact => {
			if (contact?.roomID === roomID) {
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
		resetContact: () => update(contact => {
			if (contact) {
				groupProps.resetProps();
				socket.emit('removeListeners');
			}
			
			return null;
		}),
		setContact: (contact: Contact) => {
			options.resetOptions();
			set(contact);
		}
	}
}

export const contact = createContact(null);
