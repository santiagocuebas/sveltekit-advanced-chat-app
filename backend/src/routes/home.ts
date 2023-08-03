import { Router } from 'express';
import { homeCtrl } from '../controllers/index.js';
import { isValidToken } from '../middlewares/logged.js';

const router = Router();

router.use(isValidToken);

router.get('/main', homeCtrl.getData);

router.get('/search/:param', homeCtrl.getSearch);

router.post('/password', homeCtrl.postPassword);

export default router;
