import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getChats = (userId) => API.get(`/chats?userId=${userId}`);
export const createChat = (members, name) => API.post("/chats", { members, name });
export const getMessages = (chatId) => API.get(`/messages/${chatId}`);
export const sendMessage = (formData) => API.post("/messages", formData);

export default API;
