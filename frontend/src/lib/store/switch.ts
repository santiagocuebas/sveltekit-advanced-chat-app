import type { IKeys } from "$lib/global";
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
			const reset: IKeys<boolean> = Object.fromEntries(
				Object.entries(options).map(([key, val]) => [key, val = false])
			);

			set(reset);
		}
	}
}

export const switchs = createSwitch({
	chat: false,
	search: false,
	group: false,
	settings: false
});
