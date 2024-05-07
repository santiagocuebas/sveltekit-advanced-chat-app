import { io } from "socket.io-client";
import { DIR } from "./config";

export const socket = io(DIR, {
  autoConnect: false,
  reconnectionDelay: 10000,
  reconnectionDelayMax: 10000,
  withCredentials: true
});
