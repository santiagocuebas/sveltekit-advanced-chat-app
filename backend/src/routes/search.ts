import { Router } from 'express';
import { isLoggedIn } from '../middlewares/logged.js';
import { User } from '../models/User.js';

const router = Router();

router.post(
	'/',
	isLoggedIn,
	async (req, res) => {
		const param = req.body.search;

		const contacts = await User.find({
			$or: [
				{ username: param },
				{ email: param }
			]
		}, 'username avatar');

		return res.json({ contacts });
	}
);

export default router;
