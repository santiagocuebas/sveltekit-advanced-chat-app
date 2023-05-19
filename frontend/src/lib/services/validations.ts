import type { Check, IKeys } from '$lib/global';
import validator from 'validator';

const checkUsername: Check = (input, customResponse) => {
	if (input.length > 0 && !validator.isLength(input, { min: 3, max: 40 })) {
		return 'The username must have between 3 and 40 characters';
	} else if (customResponse) {
		return customResponse;
	}

	return undefined;
};

const checkEmail: Check = (input, customResponse) => {
	if (input.length > 0 && !validator.isEmail(input)) {
		return 'Enter a valid email';
	} else if (!validator.isLength(input, { max: 60 })) {
		return 'The email must not have more than 60 characters';
	} else if (customResponse) {
		return customResponse;
	}

	return undefined;
};

const checkPassword: Check = (input, customResponse) => {
	if (input.length > 0 && !validator.isStrongPassword(input)) {
		return 'The password must contains at least a lowercase, a uppercase, a number and a special character';
	} else if (!validator.isLength(input, { max: 40 })) {
		return 'The password must not have more than 40 characters';
	} else if (customResponse) {
		return customResponse;
	}

	return undefined;
};

const checkConfirm: Check = (input, customResponse, pass) => {
	if (input.length > 0 && input !== pass) {
		return 'Password not match';
	} else if (customResponse) {
		return customResponse;
	}

	return undefined;
};

export const checks: IKeys<Check> = {
	username: checkUsername,
	email: checkEmail,
	password: checkPassword,
	confirmPassword: checkConfirm
};
