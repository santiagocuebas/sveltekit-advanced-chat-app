import { Router } from 'express';
import { upload } from '../upload.js';
import { homeCtrl } from '../controllers/index.js';
import { isValidToken } from '../middlewares/logged.js';
import { validate } from '../middlewares/validator.js';
import { arrayAvatar, arrayImages } from '../validations/array-validators.js';

const router = Router();

router.use(isValidToken);

router.post(
	'/group',
	upload.single('avatar'),
	validate(arrayAvatar),
	homeCtrl.postAvatar
);

router.post(
	'/images',
	upload.array('images'),
	validate(arrayImages),
	homeCtrl.postImages
);

router.get('/search/:param', upload.none(), homeCtrl.getSearch);

export default router;
