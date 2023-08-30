import { Router } from 'express';
import { upload } from '../config.js';
import { settingsCtrl } from '../controllers/index.js';
import { isValidToken } from '../middlewares/logged.js';
import { validateSettings } from '../middlewares/validator.js';
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
	validateSettings(arrayAvatar),
	settingsCtrl.postAvatar
);

router.use(upload.none());

router.post(
	'/username',
	validateSettings(arrayUsername),
	settingsCtrl.postUsername
);

router.post(
	'/description',
	validateSettings(arrayDescription),
	settingsCtrl.postDescription
);

router.post(
	'/password',
	validateSettings(arrayPassword),
	settingsCtrl.postPassword
);

router.post(
	'/unblockUsers',
	validateSettings(arrayUnblock),
	settingsCtrl.postUnblock
);

router.delete('/deleteUser', settingsCtrl.deleteUser);

export default router;
