import axios from "axios";
import { API_URL } from "@env";
const apiPublic = axios.create({
  baseURL: "https://dongthanh.space/",
});

export default apiPublic;
