export type TagType = "Confession" | "Crush" | "Rant" | "Funny Story";

export interface Post {
  id: string;
  message: string;
  tag: TagType;
  vote_count: number;
  created_at: string;
}

export type SortMode = "new" | "top";
