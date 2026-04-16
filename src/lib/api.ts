import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import type {
  ApiErrorResponse,
  AuthResponse,
  LoginInput,
  Product,
  ProductVariant,
  QuickBuyResponse,
  RegisterInput,
  User,
} from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

const browserApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

function attachInterceptors(client: typeof api) {
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          const next = `${window.location.pathname}${window.location.search}`;
          window.location.href = `/login?${new URLSearchParams({ reason: "session-expired", next })}`;
        }
      }
      return Promise.reject(error);
    }
  );
}

attachInterceptors(api);
attachInterceptors(browserApi);

function getProductClient() {
  return typeof window === "undefined" ? api : browserApi;
}

function getAuthClient() {
  return typeof window === "undefined" ? api : browserApi;
}

export const authApi = {
  login: async (payload: LoginInput) => {
    const { data } = await getAuthClient().post<AuthResponse>("/auth/login", payload);
    return data;
  },
  register: async (payload: RegisterInput) => {
    const { data } = await getAuthClient().post<AuthResponse>("/auth/register", payload);
    return data;
  },
  me: async () => {
    const { data } = await getAuthClient().get<User>("/auth/me");
    return data;
  },
};

export type VariantAttributes = {
  color: string;
  size: string;
  material: string;
};

export type VariantPayload = {
  attributes: VariantAttributes;
  price: number;
  stock: number;
  sku?: string;
};

export type CreateProductPayload = {
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  category: string;
  variants: VariantPayload[];
};

export type UpdateProductPayload = {
  name?: string;
  description?: string;
  imageUrl?: string;
  basePrice?: number;
  category?: string;
};

/** PUT /products/:id/variants/:variantId — backend only allows price, stock, and sku updates */
export type UpdateVariantPayload = {
  price?: number;
  stock?: number;
  sku?: string;
};

export const productsApi = {
  list: async () => {
    const { data } = await getProductClient().get<Product[]>("/products");
    return data;
  },

  getById: async (id: string) => {
    const { data } = await getProductClient().get<Product>(`/products/${id}`);
    return data;
  },

  create: async (payload: CreateProductPayload) => {
    const { data } = await getProductClient().post<Product>("/products", payload);
    return data;
  },

  update: async (id: string, payload: UpdateProductPayload) => {
    const { data } = await getProductClient().put<Product>(`/products/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    await getProductClient().delete(`/products/${id}`);
  },


  addVariant: async (productId: string, payload: VariantPayload) => {
    const { data } = await getProductClient().post<ProductVariant>(
      `/products/${productId}/variants`,
      payload
    );
    return data;
  },

  updateVariant: async (
    productId: string,
    variantId: string,
    payload: UpdateVariantPayload
  ) => {
    const { data } = await getProductClient().put<ProductVariant>(
      `/products/${productId}/variants/${variantId}`,
      payload
    );
    return data;
  },

  deleteVariant: async (productId: string, variantId: string) => {
    await getProductClient().delete(`/products/${productId}/variants/${variantId}`);
  },

  quickBuy: async (productId: string, payload: { variantId: string; quantity: number }) => {
    const { data } = await getProductClient().post<QuickBuyResponse>(
      `/products/${productId}/quick-buy`,
      payload
    );
    return data;
  },
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  return message ?? error.response?.data?.error ?? fallback;
}
