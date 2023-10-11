export enum Inputs {
  USERNAME = 'username',
  EMAIL = 'email',
  PASSWORD = 'password',
  CONFIRM = 'confirmPassword'
}

export enum InputsSignin {
  EMAIL = 'email',
  PASSWORD = 'password'
}

export enum Option {
  USER = 'user',
  GROUP = 'group',
  REGISTER = 'register',
  SIGNIN = 'signin',
  SETTINGS = 'settings',
  CHAT = 'chat',
  IMAGE = 'image',
  SEARCH = 'search',
  CHATS = 'chats',
  ROOMS = 'rooms'
}

export enum Formats {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  GIF = 'image/gif'
}

export enum Settings {
  AVATAR = 'avatar',
  USERNAME = 'username',
  DESCRIPTION = 'description',
  PASSWORD = 'password',
  UNBLOCK = 'unblock',
  DELETE = 'delete'
}

export enum StateOption {
  PUBLIC = 'public',
  PROTECTED = 'protected',
  PRIVATE = 'private'
}

export enum UserOptions {
  LEAVE = 'leave',
  BLOCK = 'block',
  DESTROY = 'destroy',
  BAD = 'bad'
}

export enum MemberOptions {
  LEAVE = 'leave',
  BLOCKGROUP = 'blockGroup'
}

export enum ModOptions {
  ADD = 'add',
  BAN = 'ban',
  BLOCK = 'block',
  UNBLOCK = 'unblock'
}

export enum AdminOptions {
  ADDMOD = 'addMod',
  REMOVEMOD = 'removeMod',
  AVATAR = 'avatar',
  DESCRIPTION = 'description',
  STATE = 'state',
  DESTROY = 'destroy'
}
