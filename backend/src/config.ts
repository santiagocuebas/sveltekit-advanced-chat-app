import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || '4200';

export const SECRET = process.env.SECRET as string;

export const ORIGIN = process.env.ORIGIN;

export const GITHUB_ID = process.env.GITHUB_ID;

export const GITHUB_SECRET = process.env.GITHUB_SECRET;

export const MONGO_URI = process.env.MONGO_URI as string;
