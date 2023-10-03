import { Router } from 'express';
import { upload } from '../config.js';
import { settingsCtrl } from '../controllers/index.js';
import { isValidToken } from '../middlewares/logged.js';
import { validate } from '../middlewares/validator.js';
import {
	arrayAvatar,
	arrayUsername,
	arrayDescription,
	arrayPassword,
	arrayUnblock
} from '../validations/array-validators.js';

const router = Router();

router.use(isValidToken);

router.post(
	'/avatar',
	upload.single('avatar'),
	validate(arrayAvatar),
	settingsCtrl.postAvatar
);

router.use(upload.none());

router.post('/username', validate(arrayUsername), settingsCtrl.postUsername);

router.post(
	'/description',
	validate(arrayDescription),
	settingsCtrl.postDescription
);

router.post('/password', validate(arrayPassword), settingsCtrl.postPassword);

router.post('/unblock', validate(arrayUnblock), settingsCtrl.postUnblock);

router.delete('/deleteUser', settingsCtrl.deleteUser);

export default router;
