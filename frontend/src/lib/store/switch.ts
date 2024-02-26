import type { IKeys } from "$lib/types/global";
import { writable } from "svelte/store";

function createSwitch(options: IKeys<boolean>) {
	const { subscribe, update, set } = writable(options);
	
	return {
		subscribe,
		setOption: (key: string) => update(value => {
			value[key] = true;

			for (const option of Object.keys(value)) {
				if (key !== option) value[option] = false;
			}

			return value;
		}),
		resetOptions: () => {
      for (const option of Object.keys(options)) {
        options[option] = false
      }

			set(options);
		}
	}
}

export const options = createSwitch({
	user: false,
	group: false,
	chat: false,
	image: false,
	settings: false
});

export const register = createSwitch({ user: false, register: false });
