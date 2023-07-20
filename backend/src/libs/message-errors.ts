import type { IError } from '../types/types.js';
import { ValidationError } from 'express-validator';

export const getErrorMessages = (errs: ValidationError[]): IError => {
	const message: IError = {};

	for (const e of errs) {
		if (e.type === 'field') message[e.path] = e.msg;
	}
	
	return message;
};
