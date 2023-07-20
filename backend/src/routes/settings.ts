import { Router } from 'express';
import multer from 'multer';
import { isLoggedIn } from '../middlewares/logged.js';
import { Chat, User } from '../models/index.js';
import { encryptPassword } from '../libs/bcrypt.js';

const router = Router();
const upload = multer({ dest: '../../uploads/temp' });
router.use(isLoggedIn);

router.post(
	'avatar',
	upload.single('avatar'),
	async (req, res) => {
		return res.json({ data: req.user });
	}
);

router.post('username', async (req, res) => {
	await User.updateOne({ _id: req.user.id }, { username: req.body.username });

	return res.json({ data: req.user });
});

router.post('description', async (req, res) => {
	await User.updateOne(
		{ _id: req.user.id },
		{ description: req.body.description }
	);

	return res.json({ data: req.user });
});

router.post('password', async (req, res) => {
	const password = encryptPassword(req.user.password);

	await User.updateOne({ _id: req.user.id }, { password });

	return res.json({ data: req.user });
});

router.post('unblockUsers', async (req, res) => {
	await User.updateOne(
		{ _id: req.user.id },
		{ $pull: { blacklist: { $elemMatch: { $in: { id: req.body.userIDs } } } } }
	);

	return res.json({ data: req.user });
});

router.post('deleteUser', async (req, res) => {
	const user = await User
		.findOneAndDelete({ _id: req.user.id })
		.lean({ virtuals: true });

	if (user !== null) {
		await Chat.deleteMany({ from: req.user.id });
	}

	return res.json({ data: req.user });
});

export default router;
