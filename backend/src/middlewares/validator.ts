import type { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import fs from 'fs/promises';
import { getErrorMessages } from '../libs/index.js';

export const validate = (validations: ValidationChain[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		await Promise.all(validations.map(validation => validation.run(req)));

		// Checking if fields are valids
		const result = validationResult(req);

		if (!result.isEmpty()) {			
			if (req.file !== undefined) await fs
				.unlink(req.file.path)
				.catch(err => console.error(err));
			
			if (req.files !== undefined && req.files instanceof Array) {
				for (const file of req.files) {
					await fs
						.unlink(file.path)
						.catch(err => console.error(err));
				}
			}
			
			// Serializing field errors
			const errors = getErrorMessages(result.array());

			if (req.baseUrl.includes('settings')) {
				return res.status(401).json({
					errors: true,
					message: errors
				});
			}

			return res.status(401).json({ errors });
		}

		return next();
	};
};
