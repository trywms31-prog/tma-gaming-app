import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DATA_FILE = path.resolve(process.env.DATA_FILE || "./data/db.json");

function nowIso() {
  return new Date().toISOString();
}

function seed() {
  const users = [
    {
      id: "1001",
      telegramId: 1001,
      username: "wms",
      firstName: "Wms",
      lastName: "",
      photoUrl: "",
      bio: "Support / IGL. Шукаю спокійну стопку на вечір.",
      language: "uk",
      extraPhotos: [],
      following: ["2002", "2003"],
      clanId: "clan-neon",
      createdAt: nowIso(),
    },
    {
      id: "2002",
      telegramId: 2002,
      username: "kira_awp",
      firstName: "Kira",
      lastName: "",
      photoUrl: "",
      bio: "AWPer. CS2 Premier 22k.",
      language: "uk",
      extraPhotos: [],
      following: [],
      clanId: "clan-neon",
      createdAt: nowIso(),
    },
    {
      id: "2003",
      telegramId: 2003,
      username: "dendi_fan",
      firstName: "Ostap",
      lastName: "",
      photoUrl: "",
      bio: "Mid or feed. Dota 2 Ancient.",
      language: "uk",
      extraPhotos: [],
      following: ["2002"],
      clanId: "clan-tide",
      createdAt: nowIso(),
    },
    {
      id: "2004",
      telegramId: 2004,
      username: "neon_queen",
      firstName: "Lina",
      lastName: "",
      photoUrl: "",
      bio: "Valorant Immortal. Duo only.",
      language: "en",
      extraPhotos: [],
      following: [],
      clanId: null,
      createdAt: nowIso(),
    },
  ];

  const posts = [
    {
      id: "p1",
      authorId: "2002",
      caption: "Ace на Mirage. Хто в катку після 21:00?",
      mediaUrl: "",
      mediaType: "none",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      likes: ["1001", "2003"],
      promoted: true,
    },
    {
      id: "p2",
      authorId: "2003",
      caption: "Roshan steal 0.3s. Класика.",
      mediaUrl: "",
      mediaType: "none",
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      likes: ["2002"],
      promoted: true,
    },
    {
      id: "p3",
      authorId: "2004",
      caption: "Looking for a calm ranked stack. No tilt, comms on.",
      mediaUrl: "",
      mediaType: "none",
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      likes: [],
      promoted: false,
    },
  ];

  const comments = [
    {
      id: "c1",
      postId: "p1",
      parentId: null,
      authorId: "1001",
      text: "Беру. Entry чи lurk?",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: "c2",
      postId: "p1",
      parentId: "c1",
      authorId: "2002",
      text: "Ти entry, я AWP.",
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  ];

  const clans = [
    {
      id: "clan-neon",
      name: "Neon District",
      tag: "NEON",
      description: "CS2 / Valorant. Вечірні рейтинги, без токсику.",
      logoUrl: "",
      ownerId: "2002",
      memberIds: ["2002", "1001"],
      pendingIds: [],
      requirements: "Premier 15k+ або еквівалент. Мікро обов'язково.",
      language: "uk",
      game: "CS2",
      createdAt: nowIso(),
    },
    {
      id: "clan-tide",
      name: "Tidehunters",
      tag: "TIDE",
      description: "Dota 2 стаки 5 людей. Тренування ср/нд.",
      logoUrl: "",
      ownerId: "2003",
      memberIds: ["2003"],
      pendingIds: [],
      requirements: "Ancient+. Discord.",
      language: "uk",
      game: "Dota 2",
      createdAt: nowIso(),
    },
  ];

  const lfg = [
    {
      id: "lfg1",
      authorId: "2004",
      game: "Valorant",
      mode: "Ranked",
      rank: "Immortal",
      language: "en",
      voice: true,
      role: "Duelist / Flex",
      hours: "20:00–00:00 EET",
      status: "online",
      teamSize: 5,
      neededRoles: "Controller, Sentinel",
      description: "Need two for Immortal lobby. Calm comms.",
      createdAt: nowIso(),
    },
    {
      id: "lfg2",
      authorId: "2003",
      game: "Dota 2",
      mode: "Party ranked",
      rank: "Ancient",
      language: "uk",
      voice: true,
      role: "Mid",
      hours: "18:00–23:00",
      status: "looking",
      teamSize: 5,
      neededRoles: "Pos 4, Pos 5",
      description: "Шукаю сапортів на парті. Без афк драфту.",
      createdAt: nowIso(),
    },
  ];

  return {
    users,
    posts,
    comments,
    clans,
    lfg,
    notifications: [
      {
        id: "n1",
        userId: "2002",
        type: "like",
        textUk: "Wms вподобав ваш пост",
        textEn: "Wms liked your post",
        createdAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
        read: false,
        refId: "p1",
      },
      {
        id: "n2",
        userId: "1001",
        type: "comment",
        textUk: "Kira відповів у вашому треді",
        textEn: "Kira replied in your thread",
        createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
        read: false,
        refId: "p1",
      },
      {
        id: "n3",
        userId: "1001",
        type: "clan",
        textUk: "Neon District: нова заявка на вступ",
        textEn: "Neon District: new join request",
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        read: false,
        refId: "clan-neon",
      },
    ],
  };
}

function ensure() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed(), null, 2));
  }
}

function read() {
  ensure();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function write(db) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export const db = {
  read,
  write,
  uuid: () => randomUUID(),
  now: nowIso,
};
