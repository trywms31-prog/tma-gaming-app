import { useTranslation } from "react-i18next";
import type { Clan } from "../types";

export function ClanCard({ clan, onJoin }: { clan: Clan; onJoin: () => void }) {
  const { t } = useTranslation();
  const label = clan.isMember ? t("finder.member") : clan.isPending ? t("finder.applied") : t("finder.join");
  return (
    <article className="glass gradient-border rounded-3xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neon-violet/40 to-neon-cyan/30 text-lg font-bold">
          {clan.logoUrl ? <img src={clan.logoUrl} alt="" className="h-full w-full object-cover" /> : clan.tag}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{clan.name}</h3>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-neon-cyan">[{clan.tag}]</span>
          </div>
          <p className="text-xs text-white/50">
            {clan.memberCount} {t("finder.members")} · {clan.game}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-white/75">{clan.description}</p>
      <button
        type="button"
        disabled={clan.isMember || clan.isPending}
        onClick={onJoin}
        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-neon-violet to-fuchsia-500 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {label}
      </button>
    </article>
  );
}
