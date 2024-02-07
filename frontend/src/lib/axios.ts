import axios from "axios";
import { DIR } from "./config";
import { Method } from "./types/enums";

const axiosInstance = axios.create({
  baseURL: DIR + '/api',
  method: Method.GET,
  withCredentials: true
});

export default axiosInstance;
