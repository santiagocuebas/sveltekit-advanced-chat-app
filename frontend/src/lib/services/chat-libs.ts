import type {
  IContact,
  IGroupProps,
  IInitProps,
  IInitPropsExtended,
  IList,
  IUser,
  Members
} from "$lib/types/global";
import { TypeContact } from "$lib/types/enums";
import { getId } from "./libs";

export const initGroupProps = (): IGroupProps => {
  const initGroup: IInitProps = {
    ADD: [],
    BAN: [],
    BLOCK: [],
    UNBLOCK: [],
    ADDMOD: [],
    REMOVEMOD: []
  };

	return {
		getProps: ({ description, state }: IContact) => {
      return {
        ...initGroup,
        DESCRIPTION: description,
        STATE: state as string,
        DESTROY: undefined
      }
    },
    resetProps: (values: IInitPropsExtended) => {
      Object.entries(initGroup).forEach(([key, value]) => values[key] = value);
      return values;
    }
	}
};

export const getChat = (user: IUser, contact: IContact, message: string | string[]) => {
  return {
    _id: getId(),
		from: user.id,
		to: contact.contactID,
		username: contact.type === TypeContact.GROUP ? user.username : undefined,
		content: message,
		createdAt: Date()
  }
};

export const selectAvatarURL = ({ avatar, type }: IContact | IList) => {
  if (type === TypeContact.USER) return '/uploads/avatar/' + avatar;
  return '/uploads/group-avatar/' + avatar;
};

export const getMembers = (contact: IContact) => {
  const members: Members[] = contact.members ? contact.members : [];

  return members;
};

export const isNotMember = (users: IContact[], contact: IContact) => {
  const newMembers: Members[] = [];
  const mods: Members[] = contact.mods ? contact.mods : [];
  const members: Members[] = contact.members ? contact.members : [];
  const memberIDs = [...mods, ...members].map(member => member.id);
  if (contact.admin) memberIDs.push(contact.admin);

  for (const { contactID, name } of users) {
    if (!memberIDs.includes(contactID)) newMembers.push({ id: contactID, name });
  }

  return newMembers;
};

export const addMembers = (member: Members, members: Members[]): Members[] => {
  if (
    !members
      .map(user => user.id)
      .includes(member.id)
  ) return [member, ...members];
  
  return members.filter(user => user.id !== member.id);
};

export const banMembers = (id: string, banIDs: string[]): string[] => {
  if (!banIDs.includes(id)) return [id, ...banIDs];

  return banIDs.filter(memberID => memberID !== id);
};

export const isMod = (mods: Members[] | undefined, id: string) => {
  return mods
    ?.map(({ id }) => id)
    .includes(id);
};

export const isMember = (member: Members[] | undefined, id: string) => {
  return member
    ?.map(({ id }) => id)
    .includes(id);
};
