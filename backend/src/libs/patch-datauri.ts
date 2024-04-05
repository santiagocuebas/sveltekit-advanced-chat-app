import DatauriParser from 'datauri/parser.js';
import { AvailableExts } from '../dictionary.js';

const parser = new DatauriParser();

export const dataUri = (file: Express.Multer.File) => {
	if (file) {
		const data = parser.format(AvailableExts[file.mimetype], file.buffer);

		return data.content;
	}

	return;
};
