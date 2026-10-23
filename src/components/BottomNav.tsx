import { Bell, Home, Plus, Search, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type { Tab } from "../types";

const items: { id: Tab; icon: typeof Home; accent?: boolean }[] = [
  { id: "home", icon: Home },
  { id: "search", icon: Search },
  { id: "create", icon: Plus, accent: true },
  { id: "alerts", icon: Bell },
  { id: "profile", icon: UserRound },
];

export function BottomNav({
  tab,
  unread,
  onChange,
}: {
  tab: Tab;
  unread: number;
  onChange: (tab: Tab) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav
      className="glass absolute inset-x-0 bottom-0 z-40 px-3 pt-2"
      style={{ paddingBottom: "calc(10px + var(--safe-bottom))" }}
    >
      <div className="grid grid-cols-5 items-end">
        {items.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          if (item.accent) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange("create")}
                className="-mt-7 flex flex-col items-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-orange to-neon-amber text-ink-950 shadow-glow">
                  <Icon size={26} strokeWidth={2.4} />
                </span>
                <span className="mt-1 text-[10px] text-neon-amber">{t("nav.create")}</span>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={clsx(
                "relative flex flex-col items-center gap-1 py-1 text-[10px]",
                active ? "text-neon-cyan" : "text-white/45",
              )}
            >
              <Icon size={22} />
              {item.id === "alerts" && unread > 0 && (
                <span className="absolute right-[22%] top-0 h-2 w-2 rounded-full bg-neon-orange" />
              )}
              {t(`nav.${item.id === "alerts" ? "alerts" : item.id}`)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
