export type TagType = "Confession" | "Crush" | "Rant" | "Funny Story";

export interface Post {
  id: string;
  message: string;
  tag: TagType;
  vote_count: number;
  created_at: string;
  user_id: string | null;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface Vote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: -1 | 1;
  created_at: string;
}

export type SortMode = "new" | "top";
