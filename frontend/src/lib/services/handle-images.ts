import type { ResponseData } from "$lib/types/global";
import { isValidImage, isValidAudio, isValidVideo } from "./index";
import axios from "$lib/axios";
import { groupProps } from "$lib/store";
import { Method } from "$lib/types/enums";

export const loadImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

		reader.addEventListener('load', ({ target }) => {
			const result = String(target?.result);
			resolve(result);
			groupProps.changeAvatar(file);
		}, false);

		if (file && isValidImage(file)) reader.readAsDataURL(file);
  })
};

export const getAudiovisuals = async (files: FileList | null) => {
	if (!files || files.length > 4) return null;

	const formData = new FormData();

	for (const file of files) {
		if (
			!isValidImage(file) &&
			!isValidAudio(file, files) &&
			!isValidVideo(file, files)
		) return null;
		
		formData.append('audiovisual', file);
	}

	const data: ResponseData = await axios({
		method: Method.POST,
		url: '/home/audiovisual',
		data: formData
	}).then(res => res.data)
		.catch(err => {
			console.error(err.message);
			return null;
		});

	return (data && data.filenames) ? data.filenames : null;
};

export const sendAvatar = async (avatar: string, id: string) => {
	const formData = new FormData();

	formData.append('avatar', avatar);
	formData.append('id', id);

	const data: ResponseData = await axios({
		method: Method.POST,
		url: '/home/avatar',
		data: formData
	}).then(res => res.data)
		.catch(err => {
			console.error(err.message);
			return { };
		});

	return data.filename;
};
