import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Post } from "@/lib/types";
import { ChevronUp, ChevronDown, Flag, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { CommentSection } from "./CommentSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TAG_CLASS_MAP: Record<string, string> = {
  Confession: "tag-confession",
  Crush: "tag-crush",
  Rant: "tag-rant",
  "Funny Story": "tag-funny",
};

const TAG_EMOJI: Record<string, string> = {
  Confession: "🤫",
  Crush: "💘",
  Rant: "😤",
  "Funny Story": "😂",
};

interface PostCardProps {
  post: Post;
  onVoteUpdate: () => void;
}

export function PostCard({ post, onVoteUpdate }: PostCardProps) {
  const [userVote, setUserVote] = useState<-1 | 1 | null>(null);
  const [localVoteCount, setLocalVoteCount] = useState(post.vote_count);
  const [animating, setAnimating] = useState(false);
  const [reported, setReported] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(post.message);
  const [editLoading, setEditLoading] = useState(false);
  const { user } = useAuth();

  const isOwner = user && post.user_id === user.id;

  useEffect(() => {
    const loadUserVote = async () => {
      if (!user) {
        const stored = localStorage.getItem(`vote_${post.id}`);
        if (stored) setUserVote(parseInt(stored) as -1 | 1);
        return;
      }

      const { data } = await supabase
        .from("votes")
        .select("vote_type")
        .eq("post_id", post.id)
        .eq("user_id", user.id)
        .single();

      if (data) setUserVote(data.vote_type as -1 | 1);
    };

    loadUserVote();
  }, [user, post.id]);

  useEffect(() => {
    setLocalVoteCount(post.vote_count);
  }, [post.vote_count]);

  const handleVote = async (direction: -1 | 1) => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    if (!user) {
      const stored = localStorage.getItem(`vote_${post.id}`);
      if (stored) {
        toast.error("You've already voted on this post");
        return;
      }

      localStorage.setItem(`vote_${post.id}`, direction.toString());
      setUserVote(direction);
      setLocalVoteCount(prev => prev + direction);

      await supabase
        .from("posts")
        .update({ vote_count: post.vote_count + direction })
        .eq("id", post.id);

      onVoteUpdate();
      return;
    }

    if (userVote === direction) {
      await supabase
        .from("votes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      await supabase
        .from("posts")
        .update({ vote_count: localVoteCount - direction })
        .eq("id", post.id);

      setUserVote(null);
      setLocalVoteCount(prev => prev - direction);
    } else if (userVote) {
      await supabase
        .from("votes")
        .update({ vote_type: direction })
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      await supabase
        .from("posts")
        .update({ vote_count: localVoteCount - userVote + direction })
        .eq("id", post.id);

      setLocalVoteCount(prev => prev - userVote + direction);
      setUserVote(direction);
    } else {
      await supabase.from("votes").insert({
        post_id: post.id,
        user_id: user.id,
        vote_type: direction,
      });

      await supabase
        .from("posts")
        .update({ vote_count: localVoteCount + direction })
        .eq("id", post.id);

      setUserVote(direction);
      setLocalVoteCount(prev => prev + direction);
    }

    onVoteUpdate();
  };

  const handleReport = async () => {
    if (reported) return;

    const { error } = await supabase.from("reports").insert({
      post_id: post.id,
      user_id: user?.id || null,
      reason: "Inappropriate content",
    });

    if (error?.code === "23505") {
      toast.info("You've already reported this post");
    } else if (error) {
      toast.error("Failed to report. Try again.");
    } else {
      setReported(true);
      toast.success("Post reported. Thank you!");
    }
  };

  const handleEdit = async () => {
    if (!editMessage.trim()) return;
    setEditLoading(true);

    const { error } = await supabase
      .from("posts")
      .update({ message: editMessage.trim() })
      .eq("id", post.id);

    setEditLoading(false);

    if (error) {
      toast.error("Failed to update post");
    } else {
      toast.success("Post updated!");
      setIsEditing(false);
      onVoteUpdate();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this confession? This can't be undone.")) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (error) {
      toast.error("Failed to delete post");
    } else {
      toast.success("Confession deleted");
      onVoteUpdate();
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const displayName = post.profiles?.display_name || "Anonymous";
  const avatarUrl = post.profiles?.avatar_url;

  const getInitials = (name: string) => {
    if (name === "Anonymous") return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="group rounded-2xl glass-card p-4 sm:p-5 card-hover animate-slide-up">
      <div className="flex gap-3 sm:gap-4">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <button
            onClick={() => handleVote(1)}
            className={`p-1.5 rounded-xl transition-all duration-300 active:scale-90 ${
              userVote === 1
                ? "text-primary bg-primary/15 shadow-sm glow-primary scale-105"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <ChevronUp size={22} strokeWidth={2.5} />
          </button>
          <span
            className={`text-sm font-bold font-display tabular-nums min-w-[24px] text-center transition-all duration-300 ${
              animating ? "animate-bounce-in" : ""
            } ${
              localVoteCount > 0
                ? "text-primary"
                : localVoteCount < 0
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {localVoteCount}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1.5 rounded-xl transition-all duration-300 active:scale-90 ${
              userVote === -1
                ? "text-destructive bg-destructive/15 shadow-sm scale-105"
                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            }`}
          >
            <ChevronDown size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 ring-2 ring-background">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-[10px] bg-accent font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold text-foreground">{displayName}</span>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${TAG_CLASS_MAP[post.tag]}`}>
              {TAG_EMOJI[post.tag]} {post.tag}
            </span>
            <span className="text-[11px] text-muted-foreground">{timeAgo}</span>
            <div className="ml-auto flex items-center gap-1">
              {isOwner && (
                <>
                  <button
                    onClick={() => { setIsEditing(!isEditing); setEditMessage(post.message); }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Edit post"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Delete post"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
              <button
                onClick={handleReport}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  reported
                    ? "text-muted-foreground/40 cursor-default"
                    : "text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                }`}
                title="Report post"
              >
                <Flag size={13} />
              </button>
            </div>
          </div>

          {/* Message */}
          {isEditing ? (
            <div className="space-y-2 animate-fade-in">
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="w-full text-sm p-3 rounded-xl bg-secondary/50 border-0 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none min-h-[80px] text-foreground"
                maxLength={300}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  disabled={editLoading}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-card-foreground text-[14px] leading-relaxed whitespace-pre-wrap break-words">
              {post.message}
            </p>
          )}

          {/* Comments */}
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
