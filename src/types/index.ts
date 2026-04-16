export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export interface ProductVariant {
  id: string;
  combinationKey: string;
  attributes: Record<string, string>;
  price: string;
  stock: number;
  sku: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface QuickBuyResponse {
  success: boolean;
  message: string;
  variant: ProductVariant & {
    product: Product;
  };
}
