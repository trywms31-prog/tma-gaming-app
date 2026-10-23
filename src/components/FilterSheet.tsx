import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { GAMES, MODES, RANKS } from "../constants";
import type { Filters } from "../types";
import { Sheet } from "./Sheet";

export function FilterSheet({
  open,
  value,
  onClose,
  onChange,
}: {
  open: boolean;
  value: Filters;
  onClose: () => void;
  onChange: (next: Filters) => void;
}) {
  const { t } = useTranslation();
  const set = (key: keyof Filters, v: string) => onChange({ ...value, [key]: v });
  return (
    <Sheet open={open} onClose={onClose} title={t("finder.filters")}>
      <Field label={t("finder.game")}>
        <Select value={value.game} onChange={(v) => set("game", v)} options={["", ...GAMES]} any={t("finder.any")} />
      </Field>
      <Field label={t("finder.mode")}>
        <Select value={value.mode} onChange={(v) => set("mode", v)} options={["", ...MODES]} any={t("finder.any")} />
      </Field>
      <Field label={t("finder.rank")}>
        <Select value={value.rank} onChange={(v) => set("rank", v)} options={["", ...RANKS]} any={t("finder.any")} />
      </Field>
      <Field label={t("finder.language")}>
        <Select
          value={value.language}
          onChange={(v) => set("language", v)}
          options={["", "uk", "en"]}
          any={t("finder.any")}
        />
      </Field>
      <Field label={t("finder.voice")}>
        <Select
          value={value.voice}
          onChange={(v) => set("voice", v)}
          options={["", "true", "false"]}
          any={t("finder.any")}
        />
      </Field>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-2xl border border-white/15 py-2.5"
          onClick={() => onChange({ game: "", mode: "", rank: "", language: "", voice: "" })}
        >
          {t("finder.reset")}
        </button>
        <button type="button" className="rounded-2xl bg-neon-violet py-2.5 font-semibold" onClick={onClose}>
          {t("finder.apply")}
        </button>
      </div>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block text-xs text-white/55">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  any,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  any: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-ink-800 px-3 py-2.5 text-sm text-white"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt || any}
        </option>
      ))}
    </select>
  );
}
