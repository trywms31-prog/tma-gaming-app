export type Lang = "uk" | "en";

export type User = {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  bio: string;
  language: Lang;
  extraPhotos: string[];
  clanId: string | null;
  following: string[];
};

export type Post = {
  id: string;
  authorId: string;
  caption: string;
  mediaUrl: string;
  mediaType: "none" | "photo" | "video";
  createdAt: string;
  likeCount: number;
  liked: boolean;
  commentCount: number;
  author: User | null;
  promoted?: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  text: string;
  createdAt: string;
  author: User;
};

export type Clan = {
  id: string;
  name: string;
  tag: string;
  description: string;
  logoUrl: string;
  memberCount: number;
  isMember: boolean;
  isPending: boolean;
  isOwner: boolean;
  requirements: string;
  game: string;
  language: string;
};

export type Lfg = {
  id: string;
  game: string;
  mode: string;
  rank: string;
  language: string;
  voice: boolean;
  role: string;
  hours: string;
  status: string;
  teamSize: number;
  neededRoles: string;
  description: string;
  createdAt: string;
  author: User;
};

export type NotificationItem = {
  id: string;
  type: "like" | "comment" | "clan";
  textUk: string;
  textEn: string;
  createdAt: string;
  read: boolean;
};

export type Tab = "home" | "search" | "create" | "alerts" | "profile";
export type Filters = {
  game: string;
  mode: string;
  rank: string;
  language: string;
  voice: string;
};
