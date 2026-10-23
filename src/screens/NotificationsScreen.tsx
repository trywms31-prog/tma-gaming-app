import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Heart, MessageCircle, Shield } from "lucide-react";
import { api } from "../api";
import type { NotificationItem } from "../types";

export function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api.notifications().then((r) => {
      setItems(r.notifications);
      api.markRead().catch(() => undefined);
    });
    const id = setInterval(() => {
      api.notifications().then((r) => setItems(r.notifications));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-4 pt-2">
      <h1 className="mb-3 text-xl font-semibold">{t("alerts.title")}</h1>
      {items.length === 0 && (
        <div className="glass rounded-3xl p-8 text-center text-sm text-white/50">
          <Bell className="mx-auto mb-2" />
          {t("alerts.empty")}
        </div>
      )}
      <div className="space-y-2">
        {items.map((n) => {
          const Icon = n.type === "like" ? Heart : n.type === "comment" ? MessageCircle : Shield;
          return (
            <div key={n.id} className="glass flex items-start gap-3 rounded-2xl p-3">
              <span className="mt-0.5 rounded-xl bg-white/8 p-2 text-neon-cyan">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm">{i18n.language === "en" ? n.textEn : n.textUk}</p>
                <p className="text-[11px] text-white/40">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && <span className="ml-auto mt-2 h-2 w-2 rounded-full bg-neon-orange" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
