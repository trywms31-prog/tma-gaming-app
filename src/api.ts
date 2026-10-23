const MAX_BYTES = 20 * 1024 * 1024;

let initDataRaw = "";

export function setInitData(raw: string) {
  initDataRaw = raw;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (initDataRaw) headers.set("Authorization", `tma ${initDataRaw}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "request_failed");
  return data as T;
}

export function assertMaxSize(file: File) {
  if (file.size > MAX_BYTES) {
    const err = new Error("file_too_large");
    throw err;
  }
}

export const api = {
  auth: () => request<{ user: import("./types").User }>("/api/auth/telegram", { method: "POST" }),
  me: () => request<{ user: import("./types").User; clan: import("./types").Clan | null }>("/api/me"),
  patchMe: (body: { bio?: string; language?: string }) =>
    request<{ user: import("./types").User }>("/api/me", { method: "PATCH", body: JSON.stringify(body) }),
  feed: (tab: "explore" | "following") =>
    request<{ posts: import("./types").Post[] }>(`/api/feed?tab=${tab}`),
  like: (id: string) => request<{ liked: boolean; likeCount: number }>(`/api/posts/${id}/like`, { method: "POST" }),
  comments: (id: string) => request<{ comments: import("./types").Comment[] }>(`/api/posts/${id}/comments`),
  addComment: (id: string, text: string, parentId?: string | null) =>
    request<{ comment: import("./types").Comment }>(`/api/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ text, parentId }),
    }),
  follow: (id: string) => request<{ following: boolean }>(`/api/follow/${id}`, { method: "POST" }),
  clans: (q = "") => request<{ clans: import("./types").Clan[] }>(`/api/clans${q}`),
  lfg: (q = "") => request<{ items: import("./types").Lfg[] }>(`/api/lfg${q}`),
  notifications: () =>
    request<{ notifications: import("./types").NotificationItem[] }>("/api/notifications"),
  markRead: () => request("/api/notifications/read", { method: "POST" }),
  uploadPost: (form: FormData) => request<{ post: import("./types").Post }>("/api/posts", { method: "POST", body: form }),
  createClan: (form: FormData) => request<{ clan: import("./types").Clan }>("/api/clans", { method: "POST", body: form }),
  joinClan: (id: string) => request<{ status: string }>(`/api/clans/${id}/join`, { method: "POST" }),
  createLfg: (body: Record<string, unknown>) =>
    request<{ item: import("./types").Lfg }>("/api/lfg", { method: "POST", body: JSON.stringify(body) }),
  uploadPhoto: (form: FormData) => request<{ user: import("./types").User }>("/api/me/photos", { method: "POST", body: form }),
  user: (id: string) =>
    request<{ user: import("./types").User; posts: import("./types").Post[]; clan: import("./types").Clan | null }>(
      `/api/users/${id}`,
    ),
};
