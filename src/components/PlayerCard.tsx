import { useTranslation } from "react-i18next";
import type { Lfg } from "../types";
import { Avatar } from "./Avatar";

export function PlayerCard({ item }: { item: Lfg }) {
  const { t } = useTranslation();
  const username = item.author?.username;
  return (
    <article className="glass gradient-border rounded-3xl p-4">
      <div className="flex items-center gap-3">
        <Avatar name={item.author?.firstName || "P"} src={item.author?.photoUrl} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">@{username || item.author?.firstName}</p>
          <p className="text-xs text-white/50">
            {item.game} · {item.mode} · {item.rank}
          </p>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] text-emerald-300">{item.status}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/70">
        <span className="rounded-full bg-white/8 px-2 py-1">{item.role}</span>
        <span className="rounded-full bg-white/8 px-2 py-1">{item.hours}</span>
        <span className="rounded-full bg-white/8 px-2 py-1">{item.voice ? t("finder.voiceOn") : t("finder.voiceOff")}</span>
      </div>
      <p className="mt-2 text-sm text-white/80">{item.description}</p>
      <a
        href={username ? `https://t.me/${username}` : "#"}
        className="mt-3 block rounded-2xl border border-neon-cyan/40 py-2.5 text-center text-sm font-semibold text-neon-cyan"
      >
        {t("finder.write")}
      </a>
    </article>
  );
}
