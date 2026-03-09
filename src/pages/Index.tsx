import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConfessionForm } from "@/components/ConfessionForm";
import { PostCard } from "@/components/PostCard";
import { FeedControls } from "@/components/FeedControls";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import type { Post, TagType, SortMode } from "@/lib/types";
import { MessageSquarePlus } from "lucide-react";

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("new");
  const [activeTag, setActiveTag] = useState<TagType | "All">("All");
  const [showForm, setShowForm] = useState(false);

  const fetchPosts = useCallback(async () => {
    let query = supabase.from("posts").select("*");

    if (activeTag !== "All") {
      query = query.eq("tag", activeTag);
    }

    if (sort === "new") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("vote_count", { ascending: false });
    }

    const { data } = await query;
    setPosts((data as Post[]) || []);
    setLoading(false);
  }, [sort, activeTag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">
            🎓 Campus Confessions
          </h1>
          <DarkModeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">
        {/* CTA Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <MessageSquarePlus size={18} />
          {showForm ? "Close" : "Post a Confession"}
        </button>

        {/* Form */}
        {showForm && (
          <ConfessionForm onPostCreated={fetchPosts} onClose={() => setShowForm(false)} />
        )}

        {/* Controls */}
        <FeedControls sort={sort} onSortChange={setSort} activeTag={activeTag} onTagChange={setActiveTag} />

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-card border border-border p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-display font-semibold">No confessions yet</p>
            <p className="text-sm mt-1">Be the first to spill! ☕</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVoteUpdate={fetchPosts} />
            ))}
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
        >
          <MessageSquarePlus size={24} />
        </button>
      )}
    </div>
  );
}
