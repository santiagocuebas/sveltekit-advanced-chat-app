import type { IKeys } from "$lib/types/global";
import { checks } from './validations.js';

export const isValidLength = (inputs: IKeys<string>): boolean => {
	for (const input of Object.values(inputs)) {
		if (!input.length) return false;
	}

	return true;
};

export const isValidInput = (inputs: IKeys<string>): boolean => {
	for (const input of Object.keys(inputs)) {
		if (checks[input](inputs[input], undefined, inputs['password'])) return false;
	}

	return true;
};
