import { io } from "socket.io-client";
import { DIR } from "./config";

export const socket = io(DIR, {
  autoConnect: false,
  reconnectionDelayMax: 30000,
  withCredentials: true
});
