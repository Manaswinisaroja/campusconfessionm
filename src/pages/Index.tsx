import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ConfessionForm } from "@/components/ConfessionForm";
import { PostCard } from "@/components/PostCard";
import { FeedControls } from "@/components/FeedControls";
import { SearchBar } from "@/components/SearchBar";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { useAuth } from "@/contexts/AuthContext";
import type { Post, TagType, SortMode } from "@/lib/types";
import { MessageSquarePlus, LogOut } from "lucide-react";

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("new");
  const [activeTag, setActiveTag] = useState<TagType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    let query = supabase
      .from("posts")
      .select("*, profiles!posts_user_id_profiles_fkey(display_name, avatar_url)");

    if (activeTag !== "All") {
      query = query.eq("tag", activeTag);
    }

    if (sort === "new") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("vote_count", { ascending: false });
    }

    const { data } = await query;
    setPosts((data as unknown as Post[]) || []);
    setLoading(false);
  }, [sort, activeTag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter posts by search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.message.toLowerCase().includes(query) ||
      post.tag.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <h1 className="font-display text-xl font-bold text-foreground">🎓 Campus Confessions</h1>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            {user ? (
              <button
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-xs font-semibold flex items-center gap-1.5"
              >
                <LogOut size={14} /> Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-semibold"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <MessageSquarePlus size={18} />
          {showForm ? "Close" : "Post a Confession"}
        </button>

        {showForm && <ConfessionForm onPostCreated={fetchPosts} onClose={() => setShowForm(false)} />}

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <FeedControls sort={sort} onSortChange={setSort} activeTag={activeTag} onTagChange={setActiveTag} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-card border border-border p-4 animate-pulse h-32" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-display font-semibold">
              {searchQuery ? "No confessions found" : "No confessions yet"}
            </p>
            <p className="text-sm mt-1">
              {searchQuery ? "Try a different search term" : "Be the first to spill! ☕"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onVoteUpdate={fetchPosts} />
            ))}
          </div>
        )}
      </main>

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
