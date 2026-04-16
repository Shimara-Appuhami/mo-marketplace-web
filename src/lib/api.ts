import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import type {
  ApiErrorResponse,
  AuthResponse,
  LoginInput,
  Product,
  RegisterInput,
  User,
} from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        const next = `${window.location.pathname}${window.location.search}`;
        const params = new URLSearchParams({
          reason: "session-expired",
          next,
        });

        window.location.href = `/login?${params.toString()}`;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (payload: LoginInput) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  register: async (payload: RegisterInput) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};

export const productsApi = {
  list: async () => {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? fallback;
  }

  return message ?? error.response?.data?.error ?? fallback;
}
