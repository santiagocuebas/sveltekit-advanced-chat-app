export enum TypeContact {
  USER = 'user',
  GROUP = 'group'
}

export enum QueryType {
  USERS = 'users',
  GROUPS = 'groups'
}

export enum TypeUser {
  EMAIL = 'Email',
  GITHUB = 'Github'
}

export enum StateOption {
  PUBLIC = 'public',
  PROTECTED = 'protected',
  PRIVATE = 'private'
}

export enum Folder {
	PUBLIC = 'advanced/public/',
	USER = 'advanced/avatar/',
	GROUP = 'advanced/group-avatar/'
}

export enum QueryOption {
	USER = 'user',
	GROUP = 'group',
	SETTINGS = 'settings',
	GROUPS = 'groups'
}

export enum ImageFormats {
	APNG = 'image/apng',
	AVIF = 'image/avif',
	GIF = 'image/gif',
	JPEG = 'image/jpeg',
	PNG = 'image/png',
	SVG = 'image/svg+xml',
	WEBP = 'image/webp'
}

export enum AudioFormats {
	AAC = 'audio/aac',
	MP3 = 'audio/mpeg',
	OGG = 'audio/ogg',
	OPUS = 'audio/opus',
	WEBM = 'audio/webm'
}

export enum VideoFormats {
	MP4 = 'video/mp4',
	MPEG = 'video/mpeg',
	OGG = 'video/ogg',
	WEBM = 'video/webm'
}
