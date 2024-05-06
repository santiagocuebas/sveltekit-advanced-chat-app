import { Router } from 'express';
import { upload } from '../upload.js';
import { homeCtrl } from '../controllers/index.js';
import { isValidToken } from '../middlewares/logged.js';
import { validate } from '../middlewares/validator.js';
import {
	arrayAvatar,
	arrayImages,
	arrayChats
} from '../validations/array-validators.js';

const router = Router();

router.use(isValidToken);

router.post(
	'/avatar',
	upload.single('avatar'),
	validate(arrayAvatar),
	homeCtrl.postAvatar
);

router.post(
	'/audiovisual',
	upload.array('audiovisual'),
	validate(arrayImages),
	homeCtrl.postAudiovisual
);

router.use(upload.none());

router.get('/search', homeCtrl.getSearch);

router.get('/contacts', homeCtrl.getAllContacts);

router.get('/chats', validate(arrayChats), homeCtrl.getContactChats);

export default router;
