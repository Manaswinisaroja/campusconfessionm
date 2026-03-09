import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Comment } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MAX_COMMENT_CHARS = 150;

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles!comments_user_id_profiles_fkey(display_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    setComments((data as unknown as Comment[]) || []);
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();

      const channel = supabase
        .channel(`comments-${postId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
          () => fetchComments()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [showComments, postId]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    const trimmed = newComment.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_COMMENT_CHARS) {
      toast.error("Comment is too long");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content: trimmed,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to post comment");
      return;
    }

    setNewComment("");
    fetchComments();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
      >
        <MessageCircle size={14} />
        <span>{comments.length > 0 ? `${comments.length} comment${comments.length > 1 ? 's' : ''}` : "Comments"}</span>
      </button>

      {showComments && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {/* Comment input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={user ? "Write a comment..." : "Login to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={MAX_COMMENT_CHARS}
              disabled={!user}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-secondary/40 border border-transparent focus:border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-40 transition-all duration-200 placeholder:text-muted-foreground/50"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !newComment.trim() || !user}
              className="px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-40 active:scale-90"
            >
              <Send size={13} />
            </button>
          </div>
          {newComment && (
            <div className="text-right">
              <span className={`text-[10px] font-medium ${newComment.length > MAX_COMMENT_CHARS ? "text-destructive" : "text-muted-foreground/50"}`}>
                {newComment.length}/{MAX_COMMENT_CHARS}
              </span>
            </div>
          )}

          {/* Comments list */}
          {comments.length > 0 && (
            <div className="space-y-2.5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 animate-fade-in group/comment">
                  <Avatar className="h-6 w-6 ring-1 ring-border/30">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-[9px] bg-secondary font-bold">
                      {getInitials(comment.profiles?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 bg-secondary/30 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-foreground">
                        {comment.profiles?.display_name || "Anonymous"}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-card-foreground/90 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
