import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Post } from "../types";
import { Avatar } from "./Avatar";

function timeAgo(iso: string, lang: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.max(1, Math.round(diff / 60000));
  if (m < 60) return lang === "uk" ? `${m} хв` : `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return lang === "uk" ? `${h} год` : `${h}h`;
  const d = Math.round(h / 24);
  return lang === "uk" ? `${d} д` : `${d}d`;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onFollow,
  following,
}: {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onFollow?: () => void;
  following?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const name = post.author?.username ? `@${post.author.username}` : post.author?.firstName || "player";
  return (
    <article className="glass gradient-border overflow-hidden rounded-3xl">
      <div className="flex items-center gap-3 px-3 py-3">
        <Avatar name={post.author?.firstName || "P"} src={post.author?.photoUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-white/45">{timeAgo(post.createdAt, i18n.language)}</p>
        </div>
        {onFollow && (
          <button
            type="button"
            onClick={onFollow}
            className="rounded-full border border-neon-violet/40 px-3 py-1 text-xs text-neon-violet"
          >
            {following ? t("feed.following") : t("feed.follow")}
          </button>
        )}
      </div>
      {post.mediaType === "photo" && post.mediaUrl && (
        <img src={post.mediaUrl} alt="" className="max-h-80 w-full object-cover" />
      )}
      {post.mediaType === "video" && post.mediaUrl && (
        <video src={post.mediaUrl} controls className="max-h-80 w-full bg-black" />
      )}
      {post.caption && <p className="px-3 py-2 text-sm leading-relaxed text-white/85">{post.caption}</p>}
      <div className="flex items-center gap-4 px-3 pb-3 text-sm">
        <button type="button" onClick={onLike} className="flex items-center gap-1.5">
          <Heart size={18} className={post.liked ? "fill-neon-orange text-neon-orange" : "text-white/70"} />
          {post.likeCount}
        </button>
        <button type="button" onClick={onComment} className="flex items-center gap-1.5 text-white/70">
          <MessageCircle size={18} />
          {post.commentCount}
        </button>
        <button type="button" onClick={onShare} className="ml-auto flex items-center gap-1.5 text-white/70">
          <Share2 size={18} />
          {t("feed.share")}
        </button>
      </div>
    </article>
  );
}
