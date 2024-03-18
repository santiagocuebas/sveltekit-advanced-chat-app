import type { ResponseData } from "$lib/types/global";
import axios from "$lib/axios";
import { groupProps } from "$lib/store";
import { Formats, Method } from "$lib/types/enums";

export const loadImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
		const validFormats: string[] = Object.values(Formats);

		reader.addEventListener('load', ({ target }) => {
			const result = String(target?.result);
			resolve(result);
			groupProps.changeAvatar(file);
		}, false);

		if (file && file.size < 2e7 && validFormats.includes(file.type)) {
			reader.readAsDataURL(file);
		}
  })
};

export const getImages = async (files: FileList | null) => {
	let filenames: string[] | null = null;

	if (files && files.length < 4) {
		const formData = new FormData();
		const validFormat: string[] = Object.values(Formats);
		let match = true;

		for (const file of files) {
			if (file.size > 1e7 * 2 && !validFormat.includes(file.type)) {
				match = false;
				break;
			}

			formData.append('images', file);
		}

		if (match) {
			const data: ResponseData = await axios({
				method: Method.POST,
				url: '/home/images',
				data: formData
			}).then(res => res.data)
				.catch(err => err.response?.data);

			if (data && data.filenames) filenames = data.filenames;
		}
	}

	return filenames;
};

export const sendAvatar = async (avatar: string, id: string) => {
	const formData = new FormData();

	formData.append('avatar', avatar);
	formData.append('id', id);

	const data: ResponseData = await axios({
		method: Method.POST,
		url: '/home/group',
		data: formData
	}).then(res => res.data)
		.catch(err => err.response?.data ?? { });

	return data.filename;
};
