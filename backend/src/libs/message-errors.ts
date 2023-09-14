import type { IKeys } from '../types/types.js';
import { ValidationError } from 'express-validator';

export const getErrorMessages = (errs: ValidationError[]): IKeys<string> => {
	const message: IKeys<string> = {};

	for (const e of errs) {
		if (e.type === 'field') message[e.path] = e.msg;
	}
	
	return message;
};
