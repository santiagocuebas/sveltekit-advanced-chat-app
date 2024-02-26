import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_KEY, CLOUDINARY_NAME, CLOUDINARY_SECRET } from './config.js';
import { Direction } from './types/types.js';

const cloudinaryConfig: Direction = (_req, _res, next) => {
	cloudinary.config({
		cloud_name: CLOUDINARY_NAME,
		api_key: CLOUDINARY_KEY,
		api_secret: CLOUDINARY_SECRET
	});

	next();
};

export { cloudinaryConfig };
