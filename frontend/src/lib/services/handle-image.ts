import { LoadError } from "$lib/enums";

export function loadImage(file: File) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();

		fileReader.addEventListener('load', ({ target, loaded }) => {
			const validFormats = ['png', 'jpg', 'jpeg', 'gif'];
			const [data] = (target?.result as string).split(';');
			const [_placeholder, format] = data.split('/');
			
			if (loaded <= 512000 && validFormats.includes(format)) {
				return resolve({ image: target?.result, enabled: false });
			}

			if (!validFormats.includes(format)) {
				return reject({ message: LoadError.InvalidFormat, error: true });
			} else if (loaded > 512000) {
				return reject({ message: LoadError.TooHeavy, error: true });
			}

			return reject({ message: LoadError.OtherError, error: true });
		});

		fileReader.addEventListener('error', (err) => reject(err));
		
		fileReader.readAsDataURL(file);
	});
}
