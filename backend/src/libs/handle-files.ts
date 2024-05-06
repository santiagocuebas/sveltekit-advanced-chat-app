import { v2 as cloudinary } from 'cloudinary';
import DatauriParser from 'datauri/parser.js';
import { getId } from './index.js';
import { AvailableExts } from '../dictionary.js';

const parser = new DatauriParser();
const validImageExt = ['apng', 'avif', 'gif', 'jpg', 'png', 'svg', 'webp'];

export const loadFile = async (
	fileBuffer: Express.Multer.File | undefined,
	folder: string,
	type?: string
) => {
	const file = fileBuffer
		? parser.format(AvailableExts[fileBuffer.mimetype], fileBuffer.buffer)?.content
		: undefined;

	if (file === undefined) return null;

	const public_id = await getId(type);

	return await cloudinary
		.uploader
		.upload(file, { public_id, folder, resource_type: 'auto' })
		.catch(() => {
			console.log('An error occurred while trying to uploaded the image');
			return null;
		});
};

export const deleteFile = async (file: string, folder: string) => {
	const [fullFileName] = file.split('/').reverse();
	const [fileName, fileExt] = fullFileName.split('.');
	const resource_type = validImageExt.includes(fileExt) ? 'image' : 'video';
					
	await cloudinary
		.uploader
		.destroy(folder + fileName, { resource_type })
		.catch(() => {
			console.error('An error occurred while trying to delete the file');
		});
};
