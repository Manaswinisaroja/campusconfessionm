import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/lib/types";
import { ChevronUp, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TAG_CLASS_MAP: Record<string, string> = {
  Confession: "tag-confession",
  Crush: "tag-crush",
  Rant: "tag-rant",
  "Funny Story": "tag-funny",
};

interface PostCardProps {
  post: Post;
  onVoteUpdate: () => void;
}

export function PostCard({ post, onVoteUpdate }: PostCardProps) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [animating, setAnimating] = useState(false);
  const storageKey = `vote_${post.id}`;

  // Check localStorage for existing vote
  const existingVote = typeof window !== "undefined" ? (localStorage.getItem(storageKey) as "up" | "down" | null) : null;
  const currentVote = voted ?? existingVote;

  const handleVote = async (direction: "up" | "down") => {
    if (currentVote === direction) return; // Already voted this way

    const delta = direction === "up" ? 1 : -1;
    const adjustment = currentVote ? (direction === "up" ? 2 : -2) : delta;

    setVoted(direction);
    localStorage.setItem(storageKey, direction);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    await supabase
      .from("posts")
      .update({ vote_count: post.vote_count + adjustment })
      .eq("id", post.id);

    onVoteUpdate();
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up">
      <div className="flex gap-3">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <button
            onClick={() => handleVote("up")}
            className={`p-1 rounded-md transition-colors ${
              currentVote === "up"
                ? "text-primary bg-accent"
                : "text-muted-foreground hover:text-primary hover:bg-accent"
            }`}
          >
            <ChevronUp size={20} />
          </button>
          <span
            className={`text-sm font-semibold font-display tabular-nums ${
              animating ? "animate-vote-pop" : ""
            } ${
              post.vote_count > 0
                ? "text-primary"
                : post.vote_count < 0
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {post.vote_count}
          </span>
          <button
            onClick={() => handleVote("down")}
            className={`p-1 rounded-md transition-colors ${
              currentVote === "down"
                ? "text-destructive bg-destructive/10"
                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            }`}
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${TAG_CLASS_MAP[post.tag]}`}>
              {post.tag}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
            {post.message}
          </p>
        </div>
      </div>
    </div>
  );
}
