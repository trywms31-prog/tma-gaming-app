import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import type { Comment } from "../types";
import { Avatar } from "./Avatar";
import { Sheet } from "./Sheet";

export function CommentsSheet({
  postId,
  open,
  onClose,
  onAdded,
}: {
  postId: string | null;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !postId) return;
    api.comments(postId).then((r) => setComments(r.comments));
  }, [open, postId]);

  const tree = useMemo(() => comments.filter((c) => !c.parentId), [comments]);

  async function send() {
    if (!postId || !text.trim()) return;
    const { comment } = await api.addComment(postId, text.trim(), replyTo);
    setComments((prev) => [...prev, comment]);
    setText("");
    setReplyTo(null);
    onAdded();
  }

  return (
    <Sheet open={open} onClose={onClose} title={t("feed.commentsTitle")}>
      <div className="space-y-3">
        {tree.map((c) => (
          <CommentNode
            key={c.id}
            comment={c}
            all={comments}
            onReply={(id) => setReplyTo(id)}
            replyLabel={t("feed.reply")}
          />
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("feed.placeholder")}
          className="flex-1 rounded-2xl border border-white/10 bg-ink-800 px-3 py-2.5 text-sm"
        />
        <button type="button" onClick={send} className="rounded-2xl bg-neon-amber px-3 font-semibold text-ink-950">
          {t("feed.send")}
        </button>
      </div>
    </Sheet>
  );
}

function CommentNode({
  comment,
  all,
  onReply,
  replyLabel,
}: {
  comment: Comment;
  all: Comment[];
  onReply: (id: string) => void;
  replyLabel: string;
}) {
  const children = all.filter((c) => c.parentId === comment.id);
  return (
    <div>
      <div className="flex gap-2">
        <Avatar name={comment.author?.firstName || "U"} src={comment.author?.photoUrl} size={28} />
        <div className="flex-1">
          <p className="text-xs text-white/50">@{comment.author?.username || comment.author?.firstName}</p>
          <p className="text-sm">{comment.text}</p>
          <button type="button" className="text-[11px] text-neon-cyan" onClick={() => onReply(comment.id)}>
            {replyLabel}
          </button>
        </div>
      </div>
      {children.length > 0 && (
        <div className="ml-6 mt-2 space-y-2 border-l border-white/10 pl-3">
          {children.map((c) => (
            <CommentNode key={c.id} comment={c} all={all} onReply={onReply} replyLabel={replyLabel} />
          ))}
        </div>
      )}
    </div>
  );
}
