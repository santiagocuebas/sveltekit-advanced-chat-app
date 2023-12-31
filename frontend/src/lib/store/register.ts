import type { IKeys } from "$lib/types/global";
import { writable } from "svelte/store";

function createRegister() {
	const { subscribe, update, set } = writable({ } as IKeys<string | boolean>);
	
	return {
		subscribe,
		setOptions: (keys: string[], value: string | boolean) => {
			const options: IKeys<string | boolean> = {};

			for (const key of keys) {
				options[key] = value;
			}

			set(options)
		},
		setOption: (key: string, value: string | boolean) => update((option: IKeys<string | boolean>) => {
			option[key] = value;
			return option;
		})
	}
}

export const valueInput = createRegister();

export const errorMessage = createRegister();

export const activeError = createRegister();
