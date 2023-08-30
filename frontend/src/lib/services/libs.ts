import type { IContact, IList, IUser, Members } from "$lib/global";
import { TypeContact } from "$lib/enums";

export const setUppercaseFirstLetter = (value: string) => {
  const firstLetter = value.at(0) as string;
  return value.replace(value.at(0) as string, firstLetter.toUpperCase());
};

export const setType = (name: string) => {
  if (name === 'username' || name === 'email') return 'text';
  return 'password';
};

const getId = () => {
  const validChar = '0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ';
  let id = '';

  for (let i = 0; i < 16; i++) {
    id += validChar.at(Math.floor(Math.random() * validChar.length));
  }

  return id;
};

export const getChat = (user: IUser, contact: IContact, message: string | string[]) => {
  return {
    _id: getId(),
		from: user.id,
		to: contact.contactID,
		username: contact.type === TypeContact.GROUP ? user.username : undefined,
		content: message,
		createdAt: new Date
  }
};

export const selectAvatarURL = ({ avatar, type }: IContact | IList) => {
  if (type === TypeContact.USER) return '/uploads/avatar/' + avatar;
  return '/uploads/group-avatar/' + avatar;
}

export const isMod = (mods: Members[] | undefined, id: string) => {
    return mods
      ?.map(({ id }) => id)
      .includes(id);
}

export const isMember = (member: Members[] | undefined, id: string) => {
    return member
      ?.map(({ id }) => id)
      .includes(id);
}
