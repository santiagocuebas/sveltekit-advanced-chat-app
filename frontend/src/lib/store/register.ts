import type { RegisterInput } from "$lib/types/global";
import { writable } from "svelte/store";
import { checkEmail, checkPassword } from "$lib/services";

function createRegister(option: RegisterInput) {
	const { subscribe, update } = writable(option);
	
	return {
		subscribe,
		setInput: function (this: HTMLInputElement) {
			return update(input => {
				input.value = this.value;
				input.error = input.check(this.value);
				input.class =  input.error ? 'error' : 'focus';
	
				return input;
			});
		},
		changeClass: () => update(input => {
			if (!input.error) input.class = 'focus';

			return input;
		}),
		changeError: () => update(input => {
			if (!input.value.length) {
				input.error = undefined;
				input.class = '';
			}

			return input;
		}),
		updateError: (error: string) => update(input => {
			input.error = error;
			input.active = true;
			
			return input;
		}),
		checkActive: () => update(input => {
			if (input.active) {
				input.class = 'error';
				input.active = false;
			}

			return input;
		}),
		resetInput: () => update(input => {
			input.value = '';
			input.error = undefined;
			input.active = false;
			input.class = '';

			return input;
		})
	}
}

export const emailInput = createRegister({
	value: '',
	error: undefined,
	active: false,
	class: '',
	check: checkEmail
});

export const passInput = createRegister({
	value: '',
	error: undefined,
	active: false,
	class: '',
	check: checkPassword
});
