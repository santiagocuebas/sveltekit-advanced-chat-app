import multer from 'multer';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const __dirname: string = dirname(fileURLToPath(import.meta.url));

export const upload = multer({ dest: join(__dirname, '../uploads/temp') });
