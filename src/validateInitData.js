import crypto from "node:crypto";

function parseInitData(raw) {
  const params = new URLSearchParams(raw);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");
  const userRaw = params.get("user");
  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }
  const authDate = Number(params.get("auth_date") || 0);
  return { hash, dataCheckString, user, authDate };
}

export function validateInitData(raw, botToken, maxAgeSec = 86400) {
  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "missing_init_data" };
  }
  const parsed = parseInitData(raw);
  if (!parsed?.hash || !parsed.user?.id) {
    return { ok: false, error: "malformed_init_data" };
  }
  if (botToken) {
    const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const computed = crypto.createHmac("sha256", secret).update(parsed.dataCheckString).digest("hex");
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(parsed.hash, "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { ok: false, error: "invalid_hash" };
    }
    const age = Math.floor(Date.now() / 1000) - parsed.authDate;
    if (parsed.authDate && maxAgeSec && age > maxAgeSec) {
      return { ok: false, error: "expired_init_data" };
    }
  }
  return { ok: true, user: parsed.user, authDate: parsed.authDate };
}
