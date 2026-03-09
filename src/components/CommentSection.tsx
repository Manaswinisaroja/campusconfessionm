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
      .select("*, profiles(display_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    
    setComments((data as Comment[]) || []);
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
      
      // Subscribe to realtime updates
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
    <div className="mt-3 pt-3 border-t border-border">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle size={14} />
        <span>{comments.length > 0 ? `${comments.length} comments` : "Comments"}</span>
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
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-secondary/50 border-0 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !newComment.trim() || !user}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>

          {/* Comments list */}
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 animate-fade-in">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px] bg-accent">
                      {getInitials(comment.profiles?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {comment.profiles?.display_name || "Anonymous"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-card-foreground">{comment.content}</p>
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
