import DatauriParser from 'datauri/parser.js';
import { extname } from 'path';

const parser = new DatauriParser();

export const dataUri = (file: Express.Multer.File) => {
	if (file) {
		const data = parser.format(extname(file.originalname).toString(), file.buffer);

		return data.content;
	}

	return null;
};
