import { ImageFormats, AudioFormats, VideoFormats } from "$lib/types/enums";

const validImageFormat: string[] = Object.values(ImageFormats);
const validAudioFormat: string[] = Object.values(AudioFormats);
const validVideoFormat: string[] = Object.values(VideoFormats);
const validAudioExt = ['aac', 'mp3', 'oga', 'opus', 'weba'];
const validVideoExt = ['mp4', 'mpeg', 'ogv', 'webm'];

export const isAudio = (fileURL: string) => {
  const [ext] = fileURL.split('.').reverse();

  return validAudioExt.includes(ext);
}

export const isVideo = (fileURL: string) => {
  const [ext] = fileURL.split('.').reverse();

  return validVideoExt.includes(ext);
}

export const isValidImage = (file: File) => {
  return file.size < 2e7 && validImageFormat.includes(file.type);
};

export const isValidAudio = (file: File, files: FileList) => {
  return files.length === 1 &&
    file.size < 2.5e7 &&
    validAudioFormat.includes(file.type);
};

export const isValidVideo = (file: File, files: FileList) => {
  return files.length === 1 &&
    file.size < 2.5e7 &&
    validVideoFormat.includes(file.type);
};
