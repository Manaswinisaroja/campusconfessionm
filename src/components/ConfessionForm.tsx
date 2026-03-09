import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { containsBannedWords } from "@/lib/banned-words";
import type { TagType } from "@/lib/types";
import { toast } from "sonner";
import { Send, X } from "lucide-react";

const MAX_CHARS = 300;
const TAGS: TagType[] = ["Confession", "Crush", "Rant", "Funny Story"];
const TAG_EMOJI: Record<string, string> = {
  Confession: "🤫",
  Crush: "💘",
  Rant: "😤",
  "Funny Story": "😂",
};

interface ConfessionFormProps {
  onPostCreated: () => void;
  onClose?: () => void;
}

export function ConfessionForm({ onPostCreated, onClose }: ConfessionFormProps) {
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState<TagType>("Confession");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error("Write something first!");
      return;
    }
    if (isOverLimit) {
      toast.error("Your message is too long.");
      return;
    }
    if (containsBannedWords(trimmed)) {
      toast.error("Your post contains inappropriate language.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("posts").insert({
      message: trimmed,
      tag,
      user_id: user?.id || null,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to post. Try again.");
      return;
    }

    toast.success("Confession posted! 🎉");
    setMessage("");
    setTag("Confession");
    onPostCreated();
    onClose?.();
  };

  return (
    <div className="rounded-2xl glass-card p-5 sm:p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base font-bold text-card-foreground">Share your confession</h2>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all active:scale-90">
            <X size={18} />
          </button>
        )}
      </div>

      <Textarea
        placeholder="What's on your mind? Spill the tea... ☕"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[100px] resize-none bg-secondary/30 border border-border/40 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/30 text-sm placeholder:text-muted-foreground/50"
      />

      <div className="flex items-center justify-between mt-2 mb-4">
        <span className={`text-xs font-bold tabular-nums ${isOverLimit ? "text-destructive" : "text-muted-foreground/50"}`}>
          {charCount}/{MAX_CHARS}
        </span>
        {user && (
          <span className="text-xs text-muted-foreground">
            Posting as <span className="font-bold text-foreground">{user.user_metadata?.full_name || user.email}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={tag} onValueChange={(v) => setTag(v as TagType)}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary/30 border-border/40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAGS.map((t) => (
              <SelectItem key={t} value={t}>{TAG_EMOJI[t]} {t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent-foreground hover:opacity-90 text-primary-foreground font-bold gap-2 shadow-sm transition-all duration-200 active:scale-[0.98]"
        >
          <Send size={15} />
          {loading ? "Posting..." : "Post Confession"}
        </Button>
      </div>
    </div>
  );
}
