"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type NotifyTone = "success" | "delete";

function toastClasses(tone: NotifyTone) {
  if (tone === "delete") {
    return {
      shell: "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.4)]",
      iconWrap: "flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600",
      eyebrow: "text-[10px] font-bold uppercase tracking-[0.24em] text-rose-500",
    };
  }

  return {
    shell: "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.4)]",
    iconWrap: "flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600",
    eyebrow: "text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-500",
  };
}

function ToastCard({
  tone,
  title,
  description,
}: {
  tone: NotifyTone;
  title: string;
  description?: string;
}) {
  const styles = toastClasses(tone);
  const Icon = tone === "delete" ? Trash2 : CheckCircle2;
  const eyebrow = tone === "delete" ? "Removed" : "Saved";

  return (
    <div className={styles.shell}>
      <div className={styles.iconWrap}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className={styles.eyebrow}>{eyebrow}</p>
        <p className="mt-1 text-sm font-semibold text-slate-950">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function notifySuccess(title: string, description?: string) {
  toast.custom(<ToastCard tone="success" title={title} description={description} />, {
    duration: 3200,
    position: "top-right",
  });
}

export function notifyDelete(title: string, description?: string) {
  toast.custom(<ToastCard tone="delete" title={title} description={description} />, {
    duration: 3600,
    position: "top-right",
  });
}
