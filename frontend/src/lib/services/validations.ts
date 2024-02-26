import type { Check } from '$lib/types/global';
import validator from 'validator';

export const checkEmail: Check = (input) => {
	if (input.length && !validator.isEmail(input)) {
		return 'The username must have between 3 and 40 characters';
	} else if (!validator.isLength(input, { max: 60 })) {
		return 'The email must not have more than 60 characters';
	}

	return undefined;
};

export const checkPassword: Check = (input) => {
	if (input.length && !validator.isStrongPassword(input)) {
		return 'The password must contains at least a lowercase, a uppercase, a number and a special character';
	} else if (!validator.isLength(input, { max: 40 })) {
		return 'The password must not have more than 40 characters';
	}

	return undefined;
};
