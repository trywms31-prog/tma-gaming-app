import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { api } from "../api";
import { CommentsSheet } from "../components/CommentsSheet";
import { PostCard } from "../components/PostCard";
import type { Post } from "../types";

export function FeedScreen({ meId }: { meId: string }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"explore" | "following">("explore");
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentPost, setCommentPost] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  async function load(next = tab) {
    const { posts: list } = await api.feed(next);
    setPosts(list);
  }

  useEffect(() => {
    load(tab).catch(() => setPosts([]));
  }, [tab]);

  return (
    <div className="flex h-full flex-col">
      <div className="glass mx-4 mt-2 grid grid-cols-2 rounded-2xl p-1">
        {(["explore", "following"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={clsx("rounded-xl py-2 text-sm font-medium", tab === id && "bg-white/10 text-neon-cyan")}
          >
            {t(`feed.${id}`)}
          </button>
        ))}
      </div>
      <div className="no-scrollbar mt-3 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {posts.length === 0 && <p className="pt-10 text-center text-sm text-white/45">{t("feed.empty")}</p>}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            following={false}
            onFollow={
              post.author && post.author.id !== meId
                ? async () => {
                    await api.follow(post.author!.id);
                  }
                : undefined
            }
            onLike={async () => {
              const r = await api.like(post.id);
              setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, liked: r.liked, likeCount: r.likeCount } : p)));
            }}
            onComment={() => setCommentPost(post.id)}
            onShare={async () => {
              const url = `${location.origin}/#post-${post.id}`;
              await navigator.clipboard?.writeText(url);
              setToast(t("feed.shareCopied"));
              setTimeout(() => setToast(""), 1600);
            }}
          />
        ))}
      </div>
      {toast && (
        <div className="pointer-events-none absolute inset-x-8 top-16 rounded-2xl bg-ink-800/90 py-2 text-center text-xs">
          {toast}
        </div>
      )}
      <CommentsSheet
        postId={commentPost}
        open={Boolean(commentPost)}
        onClose={() => setCommentPost(null)}
        onAdded={() => load()}
      />
    </div>
  );
}
