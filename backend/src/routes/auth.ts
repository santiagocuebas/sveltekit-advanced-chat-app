import { Router } from 'express';
import passport from 'passport';
import { arraySignin, arrayRegister } from '../validations/array-validators.js';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/logged.js';
import { validate } from '../middlewares/validator.js';

const router = Router();

router.post(
	'/logout',
	isLoggedIn,
	(req, res, next) => {
		return req.logout(err => {
			if (err) return next(err);
			res.clearCookie('session.id');
			return res.json({ logout: true });
		});
	}
);

router.use(isNotLoggedIn);

router.post(
	'/register',
	validate(arrayRegister),
	passport.authenticate('register'),
	(_req, res) => res.json({ logged: true })
);

router.post(
	'/signin',
	validate(arraySignin),
	passport.authenticate('signin'),
	(_req, res) => res.json({ logged: true })
);

export default router;
