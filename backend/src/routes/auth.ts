import { Router } from 'express';
import { upload } from '../config.js';
import { authCtrl } from '../controllers/index.js';
import { isValidToken, isNotValidToken } from '../middlewares/logged.js';
import { validate } from '../middlewares/validator.js';
import { arraySignin, arrayRegister } from '../validations/array-validators.js';

const router = Router();

router.use(upload.none());

router.post(
	'/register',
	isNotValidToken,
	validate(arrayRegister),
	authCtrl.postRegister
);

router.post(
	'/signin',
	isNotValidToken,
	validate(arraySignin),
	authCtrl.postSignin
);

router.post('/logout', isValidToken, authCtrl.postLogout);

export default router;
