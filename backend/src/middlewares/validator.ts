import type { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import fs from 'fs-extra';
import { getErrorMessages } from '../libs/index.js';

export const validate = (validations: ValidationChain[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		await Promise.all(validations.map(validation => validation.run(req)));

		const errs = validationResult(req);

		if (errs.isEmpty()) return next();

		const errors = getErrorMessages(errs.array());

		return res.json({ errors });
	};
};

export const validateSettings = (validations: ValidationChain[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		await Promise.all(validations.map(validation => validation.run(req)));

		const errs = validationResult(req);

		if (!errs.isEmpty()) {
			if (req.file !== undefined) fs.unlink(req.file.path);

			const errors = getErrorMessages(errs.array());

			return res.json({
				errors: 'errors-settings',
				message: errors
			});
		}

		return next();
	};
};
