export enum ButtonValue {
  CHATS = 'chats',
  ROOMS = 'rooms'
}

export enum StateOption {
  PUBLIC = 'public',
  PROTECTED = 'protected',
  PRIVATE = 'private'
}

export enum UserOptions {
  LEAVE = 'LEAVE',
  DESTROY = 'DESTROY',
  BLOCK = 'BLOCK',
  BAD = 'BAD'
}

export enum MemberOptions {
  LEAVE = 'LEAVE',
  BLOCKGROUP = 'BLOCKGROUP'
}

export enum ModOptions {
  ADD = 'ADD',
  BAN = 'BAN',
  BLOCK = 'BLOCK',
  UNBLOCK = 'UNBLOCK'
}

export enum AdminOptions {
  ADDMOD = 'ADDMOD',
  REMOVEMOD = 'REMOVEMOD',
  STATE = 'STATE',
  DESTROY = 'DESTROY'
}

export enum LoadError {
  InvalidFormat = 'The format is invalid',
  TooHeavy = 'The image is too heavy',
  OtherError = 'An indeterminate error has occurred'
}

export enum TypeContact {
  USER = 'User',
  GROUP = 'Group'
}
