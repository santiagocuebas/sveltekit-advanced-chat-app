import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || '4200';

export const SECRET = process.env.SECRET as string;

export const ORIGIN = process.env.ORIGIN;

export const GITHUB_ID = process.env.GITHUB_ID;

export const GITHUB_SECRET = process.env.GITHUB_SECRET;

export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;

export const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY;

export const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET;

export const MONGO_URI = process.env.MONGO_URI as string;
