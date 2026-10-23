import type { ReactNode } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/55" onClick={onClose}>
      <div
        className="glass gradient-border max-h-[82%] overflow-y-auto rounded-t-3xl px-4 pb-6 pt-3"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="text-sm text-white/60" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
