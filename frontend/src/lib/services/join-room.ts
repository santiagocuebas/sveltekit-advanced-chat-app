import type { IForeign, IGroup } from "$lib/types/global";
import { selectJoin } from "$lib/dictionary";
import { socket } from "$lib/socket";
import { contacts, options, contact as user } from "$lib/store";


export const joinRoom = (contact: IForeign | IGroup) => {
  contacts.resetList();
  options.resetOptions();
  user.setContact(contact as never);
  socket.timeout(1000).emit(selectJoin[contact.type], contact.contactID, contact.roomID);
};
