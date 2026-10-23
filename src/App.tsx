import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";
import { api, setInitData } from "./api";
import { BottomNav } from "./components/BottomNav";
import { CreateModal } from "./components/CreateModal";
import { FeedScreen } from "./screens/FeedScreen";
import { FinderScreen } from "./screens/FinderScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { bootstrapTelegram } from "./telegram";
import type { Clan, NotificationItem, Tab, User } from "./types";

export default function App() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("home");
  const [createOpen, setCreateOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [clan, setClan] = useState<Clan | null>(null);
  const [unread, setUnread] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const boot = await bootstrapTelegram();
      setInitData(boot.initDataRaw);
      const { user: me } = await api.auth();
      setUser(me);
      const profile = await api.me();
      setUser(profile.user);
      setClan(profile.clan);
      if (profile.user.language) {
        localStorage.setItem("lang", profile.user.language);
        await i18n.changeLanguage(profile.user.language);
      }
      setReady(true);
    })().catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!user) return;
    const tick = () =>
      api.notifications().then((r) => setUnread(r.notifications.filter((n: NotificationItem) => !n.read).length));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [user]);

  function onNav(next: Tab) {
    if (next === "create") {
      setCreateOpen(true);
      return;
    }
    setTab(next);
  }

  return (
    <div
      className="relative mx-auto flex h-full max-w-md flex-col overflow-hidden"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <header className="flex items-center justify-between px-5 pb-1 pt-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-neon-cyan/80">Telegram Mini App</p>
          <h1 className="text-xl font-bold">{t("appName")}</h1>
        </div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-violet to-neon-cyan opacity-80" />
      </header>

      <main className="relative min-h-0 flex-1" style={{ paddingBottom: "calc(86px + var(--safe-bottom))" }}>
        {!ready || !user ? (
          <p className="pt-16 text-center text-sm text-white/50">{t("common.loading")}</p>
        ) : (
          <>
            {tab === "home" && <FeedScreen meId={user.id} />}
            {tab === "search" && <FinderScreen />}
            {tab === "alerts" && <NotificationsScreen />}
            {tab === "profile" && <ProfileScreen user={user} clan={clan} onUser={setUser} />}
          </>
        )}
      </main>

      <BottomNav tab={createOpen ? "create" : tab} unread={unread} onChange={onNav} />
      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(kind) => {
          if (kind === "post") setTab("home");
          if (kind === "clan" || kind === "lfg") setTab("search");
        }}
      />
    </div>
  );
}
