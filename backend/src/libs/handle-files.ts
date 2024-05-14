import fs from 'fs/promises';
import { resolve } from 'path';
import { getId } from './index.js';
import { AvailableExts } from '../dictionary.js';

export const loadFile = async (
	file: Express.Multer.File | undefined,
	type?: string
) => {
	if (file === undefined) return null;

	const fileURL = await getId(type) + AvailableExts[file.mimetype];
	const targetPath = resolve(fileURL);
 
		// Set avatar location
	await fs.rename(file.path, targetPath);

	return fileURL;
};

export const deleteFile = async (file: string) => {
	const path = resolve(file);
	
	await fs
		.unlink(path)
		.catch(err => console.error(err));
};
