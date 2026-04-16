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

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

api.interceptors.response.use(
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

// ── Auth ─────────────────────────────────────────────────────────────────────
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

// ── Payload types ─────────────────────────────────────────────────────────────
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
  basePrice: number;
  category: string;
  variants: VariantPayload[];
};

/** PUT /products/:id — replaces top-level fields only (no variants) */
export type UpdateProductPayload = {
  name?: string;
  description?: string;
  basePrice?: number;
  category?: string;
};

/** PUT /products/:id/variants/:variantId */
export type UpdateVariantPayload = Partial<VariantPayload>;

// ── Products API ──────────────────────────────────────────────────────────────
export const productsApi = {
  /** GET /products */
  list: async () => {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  /** GET /products/:id */
  getById: async (id: string) => {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  /** POST /products 🔒 */
  create: async (payload: CreateProductPayload) => {
    const { data } = await api.post<Product>("/products", payload);
    return data;
  },

  /** PUT /products/:id 🔒 */
  update: async (id: string, payload: UpdateProductPayload) => {
    const { data } = await api.put<Product>(`/products/${id}`, payload);
    return data;
  },

  /** DELETE /products/:id 🔒 */
  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },

  // ── Variant sub-resources ─────────────────────────────────────────────────

  /** POST /products/:id/variants 🔒 */
  addVariant: async (productId: string, payload: VariantPayload) => {
    const { data } = await api.post<ProductVariant>(
      `/products/${productId}/variants`,
      payload
    );
    return data;
  },

  /** PUT /products/:id/variants/:variantId 🔒 */
  updateVariant: async (
    productId: string,
    variantId: string,
    payload: UpdateVariantPayload
  ) => {
    const { data } = await api.put<ProductVariant>(
      `/products/${productId}/variants/${variantId}`,
      payload
    );
    return data;
  },

  /** DELETE /products/:id/variants/:variantId 🔒 */
  deleteVariant: async (productId: string, variantId: string) => {
    await api.delete(`/products/${productId}/variants/${variantId}`);
  },

  /** POST /products/:id/quick-buy */
  quickBuy: async (productId: string, payload: { variantId: string; quantity: number }) => {
    const { data } = await api.post<QuickBuyResponse>(
      `/products/${productId}/quick-buy`,
      payload
    );
    return data;
  },
};

// ── Error helper ──────────────────────────────────────────────────────────────
export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  return message ?? error.response?.data?.error ?? fallback;
}
