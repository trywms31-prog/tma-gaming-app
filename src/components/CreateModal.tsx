import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { api, assertMaxSize } from "../api";
import { GAMES } from "../constants";
import { Sheet } from "./Sheet";

type Mode = "menu" | "post" | "clan" | "lfg";

export function CreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (kind: "post" | "clan" | "lfg") => void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("menu");
  const [error, setError] = useState("");
  const title =
    mode === "post" ? t("create.post") : mode === "clan" ? t("create.clan") : mode === "lfg" ? t("create.lfg") : t("create.title");

  function close() {
    setMode("menu");
    setError("");
    onClose();
  }

  return (
    <Sheet open={open} onClose={close} title={title}>
      {error && <p className="mb-3 text-sm text-neon-orange">{error}</p>}
      {mode === "menu" && (
        <div className="space-y-2">
          <Action onClick={() => setMode("post")}>{t("create.post")}</Action>
          <Action onClick={() => setMode("clan")}>{t("create.clan")}</Action>
          <Action onClick={() => setMode("lfg")}>{t("create.lfg")}</Action>
        </div>
      )}
      {mode === "post" && (
        <PostForm
          onError={setError}
          onDone={() => {
            onCreated("post");
            close();
          }}
        />
      )}
      {mode === "clan" && (
        <ClanForm
          onError={setError}
          onDone={() => {
            onCreated("clan");
            close();
          }}
        />
      )}
      {mode === "lfg" && (
        <LfgForm
          onError={setError}
          onDone={() => {
            onCreated("lfg");
            close();
          }}
        />
      )}
    </Sheet>
  );
}

function Action({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-left px-4 text-sm font-medium"
    >
      {children}
    </button>
  );
}

function PostForm({ onDone, onError }: { onDone: () => void; onError: (s: string) => void }) {
  const { t } = useTranslation();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      if (file) assertMaxSize(file);
      const form = new FormData();
      form.append("caption", caption);
      if (file) form.append("file", file);
      await api.uploadPost(form);
      onDone();
    } catch (err) {
      onError((err as Error).message === "file_too_large" ? t("create.tooBig") : (err as Error).message);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={t("create.caption")}
        className="h-28 w-full rounded-2xl border border-white/10 bg-ink-800 p-3 text-sm"
      />
      <label className="block text-xs text-white/50">
        {t("create.media")}
        <input
          type="file"
          accept="image/*,video/*"
          className="mt-1 block w-full text-sm"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>
      <button className="w-full rounded-2xl bg-gradient-to-r from-neon-orange to-neon-amber py-3 font-semibold text-ink-950">
        {t("create.publish")}
      </button>
    </form>
  );
}

function ClanForm({ onDone, onError }: { onDone: () => void; onError: (s: string) => void }) {
  const { t } = useTranslation();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    try {
      if (file instanceof File && file.size) assertMaxSize(file);
      await api.createClan(form);
      onDone();
    } catch (err) {
      onError((err as Error).message === "file_too_large" ? t("create.tooBig") : (err as Error).message);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="name" required placeholder={t("create.clanName")} className="field" />
      <input name="tag" required placeholder={t("create.tag")} className="field" />
      <select name="game" className="field">
        {GAMES.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
      <textarea name="description" placeholder={t("create.description")} className="field h-20" />
      <textarea name="requirements" placeholder={t("create.requirements")} className="field h-16" />
      <input type="file" name="file" accept="image/*" />
      <button className="w-full rounded-2xl bg-neon-violet py-3 font-semibold">{t("create.publish")}</button>
    </form>
  );
}

function LfgForm({ onDone, onError }: { onDone: () => void; onError: (s: string) => void }) {
  const { t } = useTranslation();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await api.createLfg({
        game: fd.get("game"),
        mode: fd.get("mode"),
        rank: fd.get("rank"),
        language: fd.get("language"),
        voice: fd.get("voice") === "on",
        role: fd.get("role"),
        hours: fd.get("hours"),
        neededRoles: fd.get("neededRoles"),
        teamSize: Number(fd.get("teamSize") || 5),
        description: fd.get("description"),
      });
      onDone();
    } catch (err) {
      onError((err as Error).message);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <select name="game" className="field" required>
        {GAMES.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
      <input name="neededRoles" placeholder={t("create.neededRoles")} className="field" />
      <input name="role" placeholder={t("create.role")} className="field" />
      <input name="hours" placeholder={t("create.hours")} className="field" />
      <input name="mode" placeholder="Ranked" className="field" />
      <input name="rank" placeholder="Ancient" className="field" />
      <input name="teamSize" type="number" min={2} max={10} defaultValue={5} className="field" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="voice" defaultChecked /> {t("finder.voice")}
      </label>
      <textarea name="description" placeholder={t("create.description")} className="field h-20" />
      <button className="w-full rounded-2xl bg-neon-cyan py-3 font-semibold text-ink-950">{t("create.publish")}</button>
    </form>
  );
}
