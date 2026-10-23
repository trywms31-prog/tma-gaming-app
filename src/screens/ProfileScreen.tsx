import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import clsx from "clsx";
import { api, assertMaxSize } from "../api";
import { Avatar } from "./../components/Avatar";
import { ClanCard } from "../components/ClanCard";
import { Sheet } from "../components/Sheet";
import type { Clan, Post, User } from "../types";

export function ProfileScreen({
  user,
  clan,
  onUser,
}: {
  user: User;
  clan: Clan | null;
  onUser: (u: User) => void;
}) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<"posts" | "clan">("posts");
  const [settings, setSettings] = useState(false);
  const [bio, setBio] = useState(user.bio);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    api
      .user(user.id)
      .then((r) => setPosts(r.posts))
      .catch(() => undefined);
  }, [user.id]);

  async function save() {
    const { user: next } = await api.patchMe({ bio, language: i18n.language });
    onUser(next);
    setSettings(false);
  }

  async function changeLang(lang: "uk" | "en") {
    await i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    const { user: next } = await api.patchMe({ language: lang });
    onUser(next);
  }

  async function addPhoto(file: File) {
    assertMaxSize(file);
    const form = new FormData();
    form.append("file", file);
    const { user: next } = await api.uploadPhoto(form);
    onUser(next);
  }

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-6 pt-2">
      <div className="glass gradient-border rounded-3xl p-4">
        <div className="flex items-start gap-3">
          <Avatar name={user.firstName} src={user.photoUrl} size={64} />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold">@{user.username || user.firstName}</p>
            <p className="text-sm text-white/70">{user.bio || "—"}</p>
          </div>
          <button type="button" onClick={() => setSettings(true)} className="rounded-xl bg-white/8 p-2">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="glass mt-3 grid grid-cols-2 rounded-2xl p-1">
        <button
          type="button"
          className={clsx("rounded-xl py-2 text-xs", tab === "posts" && "bg-white/10 text-neon-cyan")}
          onClick={() => setTab("posts")}
        >
          {t("profile.myPosts")}
        </button>
        <button
          type="button"
          className={clsx("rounded-xl py-2 text-xs", tab === "clan" && "bg-white/10 text-neon-cyan")}
          onClick={() => setTab("clan")}
        >
          {t("profile.myClan")}
        </button>
      </div>

      <div className="mt-3">
        {tab === "posts" && (
          <div className="grid grid-cols-2 gap-2">
            {posts.length === 0 && <p className="col-span-2 text-center text-sm text-white/45">{t("profile.noPosts")}</p>}
            {posts.map((p) => (
              <div key={p.id} className="glass min-h-24 rounded-2xl p-3 text-xs">
                {p.mediaType === "photo" && p.mediaUrl ? (
                  <img src={p.mediaUrl} alt="" className="mb-2 h-24 w-full rounded-xl object-cover" />
                ) : null}
                {p.caption}
              </div>
            ))}
          </div>
        )}
        {tab === "clan" &&
          (clan ? <ClanCard clan={clan} onJoin={() => undefined} /> : <p className="text-center text-sm text-white/45">{t("profile.noClan")}</p>)}
      </div>

      <h2 className="mb-2 mt-5 text-sm font-semibold text-white/70">{t("profile.gallery")}</h2>
      <div className="grid grid-cols-3 gap-2">
        {user.extraPhotos.map((src) => (
          <img key={src} src={src} alt="" className="h-24 w-full rounded-2xl object-cover" />
        ))}
        <label className="glass flex h-24 cursor-pointer items-center justify-center rounded-2xl text-2xl text-white/40">
          +
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addPhoto(file).catch(() => undefined);
            }}
          />
        </label>
      </div>

      <Sheet open={settings} onClose={() => setSettings(false)} title={t("profile.settings")}>
        <label className="text-xs text-white/55">
          {t("profile.bio")}
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="field mt-1 h-24" placeholder={t("profile.bioPlaceholder")} />
        </label>
        <p className="mb-2 mt-4 text-xs text-white/55">{t("profile.language")}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => changeLang("uk")}
            className={clsx("rounded-2xl py-2", i18n.language.startsWith("uk") ? "bg-neon-violet" : "bg-white/8")}
          >
            {t("profile.uk")}
          </button>
          <button
            type="button"
            onClick={() => changeLang("en")}
            className={clsx("rounded-2xl py-2", i18n.language.startsWith("en") ? "bg-neon-violet" : "bg-white/8")}
          >
            {t("profile.en")}
          </button>
        </div>
        <button type="button" onClick={save} className="mt-4 w-full rounded-2xl bg-neon-amber py-3 font-semibold text-ink-950">
          {t("profile.save")}
        </button>
      </Sheet>
    </div>
  );
}
