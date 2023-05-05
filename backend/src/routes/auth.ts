import { Router } from 'express';
import passport from 'passport';
import { arrayRegister } from '../validations/array-validators.js';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/logged.js';
import { validate } from '../middlewares/validator.js';

const router = Router();

router.post(
	'/register',
	isNotLoggedIn,
	validate(arrayRegister),
	passport.authenticate('register'),
	(req, res) => {
		return res.json({ url: req.user.username });
	}
);

router.post(
	'/logout',
	isLoggedIn,
	(req, res, next) => {
		return req.logout(err => {
			if (err) return next(err);
			res.clearCookie('connect.sid');
			return res.json({ url: '/' });
		});
	}
);

export default router;
