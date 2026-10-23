import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { validateInitData } from "./validateInitData.js";
import { db } from "./store.js";

const PORT = Number(process.env.PORT || 3001);
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const DEV_AUTH = process.env.DEV_AUTH === "true";
const MAX_AGE = Number(process.env.INIT_DATA_MAX_AGE_SEC || 86400);
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");
const MAX_BYTES = 20 * 1024 * 1024;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").slice(0, 8);
    cb(null, `${Date.now()}-${db.uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const ok = /^(image|video)\//.test(file.mimetype);
    cb(ok ? null : new Error("Only image and video files are allowed"), ok);
  },
});

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));

function publicUser(u) {
  return {
    id: u.id,
    telegramId: u.telegramId,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    photoUrl: u.photoUrl,
    bio: u.bio,
    language: u.language,
    extraPhotos: u.extraPhotos || [],
    clanId: u.clanId || null,
    following: u.following || [],
  };
}

function upsertFromTelegram(tgUser) {
  const data = db.read();
  let user = data.users.find((u) => String(u.telegramId) === String(tgUser.id));
  if (!user) {
    user = {
      id: String(tgUser.id),
      telegramId: tgUser.id,
      username: tgUser.username || "",
      firstName: tgUser.first_name || "",
      lastName: tgUser.last_name || "",
      photoUrl: tgUser.photo_url || "",
      bio: "",
      language: "uk",
      extraPhotos: [],
      following: [],
      clanId: null,
      createdAt: db.now(),
    };
    data.users.push(user);
  } else {
    user.username = tgUser.username || user.username;
    user.firstName = tgUser.first_name || user.firstName;
    user.lastName = tgUser.last_name || user.lastName;
    if (tgUser.photo_url) user.photoUrl = tgUser.photo_url;
  }
  db.write(data);
  return user;
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const raw = header.startsWith("tma ") ? header.slice(4) : "";
  if (raw) {
    const result = validateInitData(raw, BOT_TOKEN, MAX_AGE);
    if (!result.ok) {
      if (!DEV_AUTH || result.error === "invalid_hash") {
        return res.status(401).json({ error: result.error });
      }
    }
    if (result.ok) {
      req.user = upsertFromTelegram(result.user);
      return next();
    }
  }

  if (DEV_AUTH) {
    const data = db.read();
    req.user = data.users.find((u) => u.id === "1001") || upsertFromTelegram({
      id: 1001,
      username: "wms",
      first_name: "Wms",
      last_name: "",
      photo_url: "",
    });
    return next();
  }

  return res.status(401).json({ error: "unauthorized" });
}

function notify(data, userId, type, textUk, textEn, refId) {
  if (!userId || userId === undefined) return;
  data.notifications.unshift({
    id: db.uuid(),
    userId: String(userId),
    type,
    textUk,
    textEn,
    createdAt: db.now(),
    read: false,
    refId: refId || null,
  });
}

function hydratePost(post, data, me) {
  const author = data.users.find((u) => u.id === post.authorId);
  const comments = data.comments.filter((c) => c.postId === post.id);
  return {
    ...post,
    author: author ? publicUser(author) : null,
    likeCount: post.likes.length,
    liked: post.likes.includes(me.id),
    commentCount: comments.length,
  };
}

function hydrateClan(clan, data, me) {
  return {
    ...clan,
    memberCount: clan.memberIds.length,
    isMember: clan.memberIds.includes(me.id),
    isPending: clan.pendingIds.includes(me.id),
    isOwner: clan.ownerId === me.id,
    owner: (() => {
      const owner = data.users.find((u) => u.id === clan.ownerId);
      return owner ? publicUser(owner) : null;
    })(),
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, telegramAuth: Boolean(BOT_TOKEN), devAuth: DEV_AUTH });
});

app.post("/api/auth/telegram", auth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get("/api/me", auth, (req, res) => {
  const data = db.read();
  const me = data.users.find((u) => u.id === req.user.id);
  const clan = me.clanId ? data.clans.find((c) => c.id === me.clanId) : null;
  res.json({ user: publicUser(me), clan: clan ? hydrateClan(clan, data, me) : null });
});

app.patch("/api/me", auth, (req, res) => {
  const data = db.read();
  const me = data.users.find((u) => u.id === req.user.id);
  if (typeof req.body.bio === "string") me.bio = req.body.bio.slice(0, 280);
  if (req.body.language === "uk" || req.body.language === "en") me.language = req.body.language;
  db.write(data);
  res.json({ user: publicUser(me) });
});

app.post("/api/me/photos", auth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file_required" });
  const data = db.read();
  const me = data.users.find((u) => u.id === req.user.id);
  const url = `/uploads/${req.file.filename}`;
  me.extraPhotos = [...(me.extraPhotos || []), url].slice(-12);
  db.write(data);
  res.json({ user: publicUser(me) });
});

app.get("/api/feed", auth, (req, res) => {
  const tab = req.query.tab === "following" ? "following" : "explore";
  const data = db.read();
  const me = data.users.find((u) => u.id === req.user.id);
  let posts = [...data.posts];
  if (tab === "following") {
    const ids = new Set(me.following || []);
    posts = posts.filter((p) => ids.has(p.authorId));
  } else {
    posts.sort((a, b) => Number(b.promoted) - Number(a.promoted) || +new Date(b.createdAt) - +new Date(a.createdAt));
    if (posts.length > 1) {
      const i = Math.floor(Math.random() * Math.min(3, posts.length));
      const [picked] = posts.splice(i, 1);
      posts.unshift(picked);
    }
  }
  posts.sort((a, b) => (tab === "explore" ? 0 : +new Date(b.createdAt) - +new Date(a.createdAt)));
  res.json({ posts: posts.map((p) => hydratePost(p, data, me)) });
});

app.get("/api/posts/:id/comments", auth, (req, res) => {
  const data = db.read();
  const comments = data.comments
    .filter((c) => c.postId === req.params.id)
    .map((c) => ({ ...c, author: publicUser(data.users.find((u) => u.id === c.authorId) || {}) }));
  res.json({ comments });
});

app.post("/api/posts/:id/comments", auth, (req, res) => {
  const text = String(req.body.text || "").trim().slice(0, 500);
  if (!text) return res.status(400).json({ error: "text_required" });
  const data = db.read();
  const post = data.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "not_found" });
  const parentId = req.body.parentId || null;
  if (parentId && !data.comments.some((c) => c.id === parentId)) {
    return res.status(400).json({ error: "parent_not_found" });
  }
  const comment = {
    id: db.uuid(),
    postId: post.id,
    parentId,
    authorId: req.user.id,
    text,
    createdAt: db.now(),
  };
  data.comments.push(comment);
  if (post.authorId !== req.user.id) {
    notify(
      data,
      post.authorId,
      "comment",
      `${req.user.firstName} прокоментував ваш пост`,
      `${req.user.firstName} commented on your post`,
      post.id,
    );
  }
  db.write(data);
  res.json({ comment: { ...comment, author: publicUser(req.user) } });
});

app.post("/api/posts/:id/like", auth, (req, res) => {
  const data = db.read();
  const post = data.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "not_found" });
  const liked = post.likes.includes(req.user.id);
  post.likes = liked ? post.likes.filter((id) => id !== req.user.id) : [...post.likes, req.user.id];
  if (!liked && post.authorId !== req.user.id) {
    notify(
      data,
      post.authorId,
      "like",
      `${req.user.firstName} вподобав ваш пост`,
      `${req.user.firstName} liked your post`,
      post.id,
    );
  }
  db.write(data);
  res.json({ liked: !liked, likeCount: post.likes.length });
});

app.post("/api/posts", auth, upload.single("file"), (req, res) => {
  const caption = String(req.body.caption || "").trim().slice(0, 1000);
  if (!caption && !req.file) return res.status(400).json({ error: "content_required" });
  if (req.file && req.file.size > MAX_BYTES) {
    return res.status(400).json({ error: "file_too_large" });
  }
  const data = db.read();
  const mediaType = req.file ? (req.file.mimetype.startsWith("video/") ? "video" : "photo") : "none";
  const post = {
    id: db.uuid(),
    authorId: req.user.id,
    caption,
    mediaUrl: req.file ? `/uploads/${req.file.filename}` : "",
    mediaType,
    createdAt: db.now(),
    likes: [],
    promoted: false,
  };
  data.posts.unshift(post);
  db.write(data);
  res.json({ post: hydratePost(post, data, req.user) });
});

app.post("/api/follow/:id", auth, (req, res) => {
  const data = db.read();
  const me = data.users.find((u) => u.id === req.user.id);
  const target = data.users.find((u) => u.id === req.params.id);
  if (!target || target.id === me.id) return res.status(400).json({ error: "invalid_user" });
  const following = me.following.includes(target.id);
  me.following = following ? me.following.filter((id) => id !== target.id) : [...me.following, target.id];
  db.write(data);
  res.json({ following: !following });
});

app.get("/api/clans", auth, (req, res) => {
  const data = db.read();
  const { game, language } = req.query;
  let clans = data.clans;
  if (game) clans = clans.filter((c) => c.game === game);
  if (language) clans = clans.filter((c) => c.language === language);
  res.json({ clans: clans.map((c) => hydrateClan(c, data, req.user)) });
});

app.post("/api/clans", auth, upload.single("file"), (req, res) => {
  const name = String(req.body.name || "").trim().slice(0, 40);
  const tag = String(req.body.tag || "").trim().slice(0, 8).toUpperCase();
  const description = String(req.body.description || "").trim().slice(0, 400);
  const requirements = String(req.body.requirements || "").trim().slice(0, 240);
  const game = String(req.body.game || "CS2");
  const language = req.body.language === "en" ? "en" : "uk";
  if (!name || !tag) return res.status(400).json({ error: "name_and_tag_required" });
  const data = db.read();
  const clan = {
    id: db.uuid(),
    name,
    tag,
    description,
    requirements,
    game,
    language,
    logoUrl: req.file ? `/uploads/${req.file.filename}` : "",
    ownerId: req.user.id,
    memberIds: [req.user.id],
    pendingIds: [],
    createdAt: db.now(),
  };
  const me = data.users.find((u) => u.id === req.user.id);
  me.clanId = clan.id;
  data.clans.unshift(clan);
  db.write(data);
  res.json({ clan: hydrateClan(clan, data, me) });
});

app.post("/api/clans/:id/join", auth, (req, res) => {
  const data = db.read();
  const clan = data.clans.find((c) => c.id === req.params.id);
  if (!clan) return res.status(404).json({ error: "not_found" });
  if (clan.memberIds.includes(req.user.id)) return res.json({ status: "member" });
  if (!clan.pendingIds.includes(req.user.id)) clan.pendingIds.push(req.user.id);
  notify(
    data,
    clan.ownerId,
    "clan",
    `${req.user.firstName} подав заявку в ${clan.name}`,
    `${req.user.firstName} applied to ${clan.name}`,
    clan.id,
  );
  db.write(data);
  res.json({ status: "pending" });
});

app.post("/api/clans/:id/applications/:userId", auth, (req, res) => {
  const accept = Boolean(req.body.accept);
  const data = db.read();
  const clan = data.clans.find((c) => c.id === req.params.id);
  if (!clan || clan.ownerId !== req.user.id) return res.status(403).json({ error: "forbidden" });
  clan.pendingIds = clan.pendingIds.filter((id) => id !== req.params.userId);
  if (accept) {
    if (!clan.memberIds.includes(req.params.userId)) clan.memberIds.push(req.params.userId);
    const applicant = data.users.find((u) => u.id === req.params.userId);
    if (applicant) applicant.clanId = clan.id;
    notify(data, req.params.userId, "clan", `Вас прийнято до ${clan.name}`, `You were accepted into ${clan.name}`, clan.id);
  } else {
    notify(data, req.params.userId, "clan", `Заявку в ${clan.name} відхилено`, `Your ${clan.name} application was declined`, clan.id);
  }
  db.write(data);
  res.json({ clan: hydrateClan(clan, data, req.user) });
});

app.get("/api/lfg", auth, (req, res) => {
  const data = db.read();
  const { game, mode, rank, language, voice } = req.query;
  let items = data.lfg;
  if (game) items = items.filter((x) => x.game === game);
  if (mode) items = items.filter((x) => x.mode === mode);
  if (rank) items = items.filter((x) => x.rank === rank);
  if (language) items = items.filter((x) => x.language === language);
  if (voice === "true") items = items.filter((x) => x.voice);
  if (voice === "false") items = items.filter((x) => !x.voice);
  res.json({
    items: items.map((item) => ({
      ...item,
      author: publicUser(data.users.find((u) => u.id === item.authorId) || {}),
    })),
  });
});

app.post("/api/lfg", auth, (req, res) => {
  const body = req.body || {};
  const game = String(body.game || "").trim();
  if (!game) return res.status(400).json({ error: "game_required" });
  const data = db.read();
  const item = {
    id: db.uuid(),
    authorId: req.user.id,
    game,
    mode: String(body.mode || "Ranked").slice(0, 40),
    rank: String(body.rank || "Any").slice(0, 40),
    language: body.language === "en" ? "en" : "uk",
    voice: Boolean(body.voice),
    role: String(body.role || "").slice(0, 40),
    hours: String(body.hours || "").slice(0, 40),
    status: "looking",
    teamSize: Number(body.teamSize || 5),
    neededRoles: String(body.neededRoles || "").slice(0, 80),
    description: String(body.description || "").slice(0, 400),
    createdAt: db.now(),
  };
  data.lfg.unshift(item);
  db.write(data);
  res.json({ item: { ...item, author: publicUser(req.user) } });
});

app.get("/api/notifications", auth, (req, res) => {
  const data = db.read();
  const items = data.notifications.filter((n) => n.userId === req.user.id);
  res.json({ notifications: items });
});

app.post("/api/notifications/read", auth, (_req, res) => {
  const data = db.read();
  data.notifications.forEach((n) => {
    if (n.userId === req.user.id) n.read = true;
  });
  db.write(data);
  res.json({ ok: true });
});

app.get("/api/users/:id", auth, (req, res) => {
  const data = db.read();
  const user = data.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "not_found" });
  const posts = data.posts.filter((p) => p.authorId === user.id).map((p) => hydratePost(p, data, req.user));
  const clan = user.clanId ? data.clans.find((c) => c.id === user.clanId) : null;
  res.json({
    user: publicUser(user),
    posts,
    clan: clan ? hydrateClan(clan, data, req.user) : null,
    following: (req.user.following || []).includes(user.id),
  });
});

app.use((err, _req, res, _next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "file_too_large", maxMb: 20 });
  }
  if (err) return res.status(400).json({ error: err.message || "upload_error" });
  res.status(500).json({ error: "server_error" });
});

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
