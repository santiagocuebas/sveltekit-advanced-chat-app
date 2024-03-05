import { Router } from 'express';
import { upload } from '../upload.js';
import { authCtrl } from '../controllers/index.js';
import { isNotValidToken, isValidToken } from '../middlewares/logged.js';
import { validate } from '../middlewares/validator.js';
import { arrayRegister } from '../validations/array-validators.js';

const router = Router();

router.use(upload.none());

router.get('/', isValidToken, authCtrl.getData);

router.post('/password', isValidToken, authCtrl.postPassword);

router.get('/getAccessToken', isNotValidToken, authCtrl.getAccessToken);

router.post(
	'/register',
	isNotValidToken,
	validate(arrayRegister),
	authCtrl.postRegister
);

export default router;
