import type { IKeys } from "$lib/types/global";
import { Inputs } from "$lib/types/enums.js";
import { checks } from './validations.js';

export const isValidLength = (inputs: IKeys<string>): boolean => {
	for (const input of Object.values(inputs)) {
		if (!input.length) return false;
	}

	return true;
};

export const isValidInput = (inputs: IKeys<string>): boolean => {
	for (const input of Object.keys(inputs)) {
		if (checks[input](inputs[input], undefined, inputs[Inputs.PASSWORD])) {
			return false;
		}
	}

	return true;
};
