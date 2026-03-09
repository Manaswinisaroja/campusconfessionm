import type { TagType, SortMode } from "@/lib/types";
import { Flame, Clock } from "lucide-react";

const TAGS: (TagType | "All")[] = ["All", "Confession", "Crush", "Rant", "Funny Story"];

const TAG_EMOJI: Record<string, string> = {
  All: "✨",
  Confession: "🤫",
  Crush: "💘",
  Rant: "😤",
  "Funny Story": "😂",
};

const TAG_ACTIVE_MAP: Record<string, string> = {
  All: "bg-primary text-primary-foreground shadow-sm",
  Confession: "tag-confession font-bold",
  Crush: "tag-crush font-bold",
  Rant: "tag-rant font-bold",
  "Funny Story": "tag-funny font-bold",
};

interface FeedControlsProps {
  sort: SortMode;
  onSortChange: (s: SortMode) => void;
  activeTag: TagType | "All";
  onTagChange: (t: TagType | "All") => void;
}

export function FeedControls({ sort, onSortChange, activeTag, onTagChange }: FeedControlsProps) {
  return (
    <div className="space-y-3">
      {/* Sort */}
      <div className="flex gap-2">
        <button
          onClick={() => onSortChange("new")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
            sort === "new"
              ? "bg-primary text-primary-foreground shadow-sm glow-primary"
              : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Clock size={14} /> New
        </button>
        <button
          onClick={() => onSortChange("top")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
            sort === "top"
              ? "bg-primary text-primary-foreground shadow-sm glow-primary"
              : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Flame size={14} /> Top
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => onTagChange(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
              activeTag === t
                ? TAG_ACTIVE_MAP[t]
                : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {TAG_EMOJI[t]} {t}
          </button>
        ))}
      </div>
    </div>
  );
}
