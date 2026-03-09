import type { TagType, SortMode } from "@/lib/types";
import { Flame, Clock } from "lucide-react";

const TAGS: (TagType | "All")[] = ["All", "Confession", "Crush", "Rant", "Funny Story"];

const TAG_ACTIVE_MAP: Record<string, string> = {
  All: "bg-primary text-primary-foreground",
  Confession: "bg-tag-confession/20 text-tag-confession border-tag-confession/30",
  Crush: "bg-tag-crush/20 text-tag-crush border-tag-crush/30",
  Rant: "bg-tag-rant/20 text-tag-rant border-tag-rant/30",
  "Funny Story": "bg-tag-funny/20 text-tag-funny border-tag-funny/30",
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            sort === "new" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Clock size={14} /> New
        </button>
        <button
          onClick={() => onSortChange("top")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            sort === "top" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              activeTag === t
                ? TAG_ACTIVE_MAP[t]
                : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
