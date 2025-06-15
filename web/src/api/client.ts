import {OpenAPI} from "./core/OpenAPI.ts";

OpenAPI.BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
OpenAPI.TOKEN = async () => {
  return localStorage.getItem('access_token') ?? '';
}
