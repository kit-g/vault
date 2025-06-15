import {OpenAPI} from "./OpenAPI.ts";

OpenAPI.BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
