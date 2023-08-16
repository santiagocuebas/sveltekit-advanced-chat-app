import { Router } from 'express';
import multer from 'multer';
import { join } from 'path';
import { __dirname } from '../config.js';
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
const upload = multer({ dest: join(__dirname, '../uploads/temp') });

router.use(isValidToken);

router.post(
	'/avatar',
	upload.single('avatar'),
	validateSettings(arrayAvatar),
	settingsCtrl.postAvatar
);

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
