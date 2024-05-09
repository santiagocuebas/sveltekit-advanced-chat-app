import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import { cloudinaryConfig } from './cloudinary.js';
import { ORIGIN } from './config.js';

// Initializations
const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
	origin: ORIGIN,
	methods: 'GET, POST, PUT, DELETE, OPTIONS',
	allowedHeaders: 'Origin, Authorization, X-Requested-With, Content-Type, Accept',
	credentials: true
}));
app.use('*', cloudinaryConfig);

export default app;
