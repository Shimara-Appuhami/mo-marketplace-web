"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, ShoppingCart } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { productsApi, getApiErrorMessage } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";
import { cn } from "@/lib/utils";

type QuickBuyButtonProps = {
  productId: string;
  variantId: string | null;
  disabled?: boolean;
  onPurchased: (nextStock: number) => void;
};

export function QuickBuyButton({
  productId,
  variantId,
  disabled = false,
  onPurchased,
}: QuickBuyButtonProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickBuy = async () => {
    if (!variantId || disabled || isSubmitting) {
      return;
    }

    if (!isAuthenticated) {
      const params = new URLSearchParams({ next: pathname });
      router.push(`/login?${params.toString()}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await productsApi.quickBuy(productId, { variantId, quantity: 1 });
      onPurchased(response.variant.stock);
      notifySuccess("Purchase completed", response.message);
    } catch (error) {
      notifyError("Quick buy failed", getApiErrorMessage(error, "Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      disabled={!variantId || disabled || isSubmitting}
      onClick={handleQuickBuy}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
        !variantId || disabled
          ? "cursor-not-allowed bg-slate-300 text-slate-500"
          : "bg-slate-950 text-white hover:bg-slate-800"
      )}
    >
      {isSubmitting ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="size-4" />
          Quick Buy
        </>
      )}
    </button>
  );
}
