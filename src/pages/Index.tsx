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
import { MessageSquarePlus, LogOut, Settings, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("new");
  const [activeTag, setActiveTag] = useState<TagType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Load user profile
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

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
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-0 border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Campus Confessions
            </span>
          </h1>
          <div className="flex items-center gap-1.5">
            <DarkModeToggle />
            {user ? (
              <>
                <Link
                  to="/settings"
                  className="p-2 rounded-xl bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                  title="Settings"
                >
                  <Settings size={16} />
                </Link>
                <button
                  onClick={async () => { await signOut(); navigate("/"); }}
                  className="p-2 rounded-xl bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
                {profile?.avatar_url && (
                  <Link to="/settings" className="ml-0.5">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="text-[10px] bg-accent font-bold">
                        {profile.display_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-xs font-bold shadow-sm glow-primary"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-5">
        {/* Post Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent-foreground text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2.5 shadow-md glow-primary active:scale-[0.98]"
        >
          <Sparkles size={18} />
          {showForm ? "Close" : "Post a Confession"}
        </button>

        {showForm && (
          <div className="animate-slide-up">
            <ConfessionForm onPostCreated={fetchPosts} onClose={() => setShowForm(false)} />
          </div>
        )}

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <FeedControls sort={sort} onSortChange={setSort} activeTag={activeTag} onTagChange={setActiveTag} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/60 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full skeleton-shimmer" />
                  <div className="h-3 w-24 rounded-full skeleton-shimmer" />
                  <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full skeleton-shimmer" />
                  <div className="h-3 w-3/4 rounded-full skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground animate-fade-in">
            <div className="text-5xl mb-4">{searchQuery ? "🔍" : "☕"}</div>
            <p className="text-lg font-display font-bold">
              {searchQuery ? "No confessions found" : "No confessions yet"}
            </p>
            <p className="text-sm mt-1.5 text-muted-foreground/70">
              {searchQuery ? "Try a different search term" : "Be the first to spill the tea!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, i) => (
              <div key={post.id} style={{ animationDelay: `${i * 50}ms` }}>
                <PostCard post={post} onVoteUpdate={fetchPosts} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground shadow-lg glow-primary flex items-center justify-center hover:opacity-90 transition-all duration-300 active:scale-90"
        >
          <MessageSquarePlus size={24} />
        </button>
      )}
    </div>
  );
}
