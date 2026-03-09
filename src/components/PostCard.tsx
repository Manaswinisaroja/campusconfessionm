import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Post } from "@/lib/types";
import { ChevronUp, ChevronDown, Flag, User } from "lucide-react";
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

interface PostCardProps {
  post: Post;
  onVoteUpdate: () => void;
}

export function PostCard({ post, onVoteUpdate }: PostCardProps) {
  const [userVote, setUserVote] = useState<-1 | 1 | null>(null);
  const [localVoteCount, setLocalVoteCount] = useState(post.vote_count);
  const [animating, setAnimating] = useState(false);
  const [reported, setReported] = useState(false);
  const { user } = useAuth();

  // Load user's existing vote
  useEffect(() => {
    const loadUserVote = async () => {
      if (!user) {
        // Check localStorage for anonymous users
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

  // Update local count when post changes
  useEffect(() => {
    setLocalVoteCount(post.vote_count);
  }, [post.vote_count]);

  const handleVote = async (direction: -1 | 1) => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (!user) {
      // Anonymous voting with localStorage
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

    // Authenticated voting
    if (userVote === direction) {
      // Remove vote
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
      // Change vote
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
      // New vote
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

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const displayName = post.profiles?.display_name || "Anonymous";
  const avatarUrl = post.profiles?.avatar_url;

  const getInitials = (name: string) => {
    if (name === "Anonymous") return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up">
      <div className="flex gap-3">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <button
            onClick={() => handleVote(1)}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              userVote === 1
                ? "text-primary bg-primary/20 scale-110"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <ChevronUp size={20} />
          </button>
          <span
            className={`text-sm font-bold font-display tabular-nums transition-all duration-200 ${
              animating ? "scale-125" : ""
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
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              userVote === -1
                ? "text-destructive bg-destructive/20 scale-110"
                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            }`}
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with user, tag, time */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-[9px] bg-accent">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-foreground">{displayName}</span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${TAG_CLASS_MAP[post.tag]}`}>
              {post.tag}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <button
              onClick={handleReport}
              className={`ml-auto p-1 rounded transition-colors ${
                reported
                  ? "text-muted-foreground cursor-default"
                  : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              }`}
              title="Report post"
            >
              <Flag size={14} />
            </button>
          </div>

          {/* Message */}
          <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
            {post.message}
          </p>

          {/* Comments */}
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
