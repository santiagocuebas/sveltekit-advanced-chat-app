import type { IContact, Members } from "$lib/types/global";
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
		addMembers: (members: Members[]) => update(value => {
			if (value.members) value.members = [...members, ...value.members];

			return value;
		}),
		banMembers: (memberIDs: string[]) => update(value => {
			if (value.members) value.members = value.members.filter(member => !memberIDs.includes(member.id));

			return value;
		}),
		blockMembers: (members: Members[]) => update(value => {
			const memberIDs = members.map(member => member.id);

			if (value.members) value.members = value.members.filter(member => !memberIDs.includes(member.id));
			if (value.blacklist) value.blacklist = [...members, ...value.blacklist];

			return value;
		}),
		unblockMembers: (memberIDs: string[]) => update(value => {
			if (value.blacklist) value.blacklist = value.blacklist.filter(member => !memberIDs.includes(member.id));

			return value;
		}),
		addMods: (mods: Members[]) => update(value => {
			const modIDs = mods.map(mods => mods.id);
			console.log(value);
			console.log(mods);

			if (value.mods) value.mods = [...mods, ...value.mods];
			if (value.members) value.members = value.members.filter(member => !modIDs.includes(member.id));

			return value;
		}),
		removeMods: (mods: Members[]) => update(value => {
			const modIDs = mods.map(mods => mods.id);
			console.log(value);
			console.log(mods);

			if (value.members) value.members = [...mods, ...value.members];
			if (value.mods) value.mods = value.mods.filter(mod => !modIDs.includes(mod.id));

			return value;
		}),
		setContact: (value: IContact) => set(value),
		resetContact: () => set({ } as IContact)
	}
}

export const contact = createContact();
