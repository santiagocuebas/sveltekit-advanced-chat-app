import { Router } from 'express';
import { isLoggedIn } from '../middlewares/logged.js';

const router = Router();

router.get(
	'/',
	isLoggedIn,
	async (req, res) => {
		req.user.password = '';

		return res.json({ user: req.user });
	}
);

export default router;
