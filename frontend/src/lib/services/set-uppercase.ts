import type { IContact, IKeys, Members } from "$lib/global";
import { TypeContact } from "$lib/enums";

export const setUppercaseFirstLetter = (value: string) => {
  const firstLetter = value.at(0) as string;
  return value.replace(value.at(0) as string, firstLetter.toUpperCase());
};

const getId = () => {
  const validChar = '0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ';
  let id = '';

  for (let i = 0; i < 16; i++) {
    id += validChar.at(Math.floor(Math.random() * validChar.length));
  }

  return id;
};

export const getChat = (id: string, contact: IContact, message: string) => {
  return {
    _id: getId(),
		from: id,
		to: contact.contactID,
		username: contact.type === TypeContact.GROUP ? contact.name : undefined,
		content: message,
		createdAt: new Date
  }
};

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
