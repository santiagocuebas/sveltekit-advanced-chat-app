import type { IKeys } from "$lib/types/global";
import { writable } from "svelte/store";

function createRegister() {
	const { subscribe, update, set } = writable({ } as IKeys<string | boolean>);
	
	return {
		subscribe,
		setOptions: (values: IKeys<string | boolean>) => set(values),
		setOption: (key: string, value: string | boolean) => update((option: IKeys<string | boolean>) => {
			option[key] = value;
			return option;
		})
	}
}

export const valueInput = createRegister();

export const errorMessage = createRegister();

export const activeError = createRegister();
