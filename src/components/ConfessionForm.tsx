import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { containsBannedWords } from "@/lib/banned-words";
import type { TagType } from "@/lib/types";
import { toast } from "sonner";
import { Send, X } from "lucide-react";

const MAX_CHARS = 300;
const TAGS: TagType[] = ["Confession", "Crush", "Rant", "Funny Story"];

interface ConfessionFormProps {
  onPostCreated: () => void;
  onClose?: () => void;
}

export function ConfessionForm({ onPostCreated, onClose }: ConfessionFormProps) {
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState<TagType>("Confession");
  const [loading, setLoading] = useState(false);

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
    const { error } = await supabase.from("posts").insert({ message: trimmed, tag });
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
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-card-foreground">Share your confession</h2>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <Textarea
        placeholder="What's on your mind? Spill the tea... ☕"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[100px] resize-none bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
      />

      <div className="flex items-center justify-between mt-2 mb-4">
        <span className={`text-xs font-medium ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
          {charCount}/{MAX_CHARS}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={tag} onValueChange={(v) => setTag(v as TagType)}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary/50 border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAGS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
        >
          <Send size={16} />
          {loading ? "Posting..." : "Post Confession"}
        </Button>
      </div>
    </div>
  );
}
