import axios from "axios";
import { FloorLayoutResponse, LayoutSaveRequest } from "../types/layout";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/layout",
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getFloorLayout = (floorId: number) =>
  API.get<FloorLayoutResponse>(`/floors/${floorId}`);

export const saveLayout = (floorId: number, data: LayoutSaveRequest) =>
  API.post(`/floors/${floorId}`, data);
