import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tailwindConfig = join(__dirname, 'tailwind.config.js');

export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: { config: tailwindConfig },
    autoprefixer: {},
  },
}
