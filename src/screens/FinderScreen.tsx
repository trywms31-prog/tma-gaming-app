import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import clsx from "clsx";
import { api } from "../api";
import { ClanCard } from "../components/ClanCard";
import { FilterSheet } from "../components/FilterSheet";
import { PlayerCard } from "../components/PlayerCard";
import type { Clan, Filters, Lfg } from "../types";

const empty: Filters = { game: "", mode: "", rank: "", language: "", voice: "" };

export function FinderScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"lfg" | "clans">("lfg");
  const [filters, setFilters] = useState<Filters>(empty);
  const [open, setOpen] = useState(false);
  const [clans, setClans] = useState<Clan[]>([]);
  const [items, setItems] = useState<Lfg[]>([]);

  function qs() {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `?${s}` : "";
  }

  async function load() {
    if (tab === "clans") setClans((await api.clans(qs())).clans);
    else setItems((await api.lfg(qs())).items);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, [tab, filters]);

  return (
    <div className="flex h-full flex-col">
      <div className="mx-4 mt-2 flex items-center gap-2">
        <div className="glass grid flex-1 grid-cols-2 rounded-2xl p-1">
          {(["lfg", "clans"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={clsx("rounded-xl py-2 text-xs font-medium", tab === id && "bg-white/10 text-neon-cyan")}
            >
              {t(`finder.${id}`)}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setOpen(true)} className="glass rounded-2xl p-3 text-neon-violet">
          <SlidersHorizontal size={18} />
        </button>
      </div>
      <div className="no-scrollbar mt-3 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {tab === "lfg"
          ? items.map((item) => <PlayerCard key={item.id} item={item} />)
          : clans.map((clan) => (
              <ClanCard
                key={clan.id}
                clan={clan}
                onJoin={async () => {
                  await api.joinClan(clan.id);
                  await load();
                }}
              />
            ))}
      </div>
      <FilterSheet open={open} value={filters} onChange={setFilters} onClose={() => setOpen(false)} />
    </div>
  );
}
