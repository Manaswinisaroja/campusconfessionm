import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Check, User, Shield, Palette } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Dusty",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Eden",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Frankie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ginger",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Bailey",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Felix",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Bailey",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Charlie",
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setSelectedAvatar(data.avatar_url || AVATAR_OPTIONS[0]);
      } else {
        setSelectedAvatar(AVATAR_OPTIONS[0]);
      }
      setInitialLoading(false);
    };

    loadProfile();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        avatar_url: selectedAvatar,
      })
      .eq("user_id", user.id);

    setLoading(false);

    if (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } else {
      toast.success("Profile updated! ✨");
      navigate("/");
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl skeleton-shimmer" />
          <div className="h-3 w-24 rounded-full skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-card border-0 border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-bold">Back</span>
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">⚙️ Settings</h1>
          <DarkModeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-slide-up">
        {/* Profile Section */}
        <section className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent-foreground flex items-center justify-center shadow-sm">
              <User size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground">Profile</h2>
              <p className="text-xs text-muted-foreground">Customize how you appear</p>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={30}
              className="bg-secondary/30 border-border/40 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <p className="text-[11px] text-muted-foreground/60">This name will be shown on your confessions and comments</p>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground">Choose Avatar</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {AVATAR_OPTIONS.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 active:scale-95 ${
                    selectedAvatar === avatar
                      ? "border-primary ring-2 ring-primary/30 scale-110 shadow-md"
                      : "border-border/60 hover:border-primary/40"
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                      <Check size={16} className="text-primary drop-shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-5 border-t border-border/40">
            <p className="text-xs font-bold text-muted-foreground mb-3">Preview</p>
            <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl border border-border/30">
              <img
                src={selectedAvatar || AVATAR_OPTIONS[0]}
                alt="Preview"
                className="w-12 h-12 rounded-2xl border-2 border-border/50 shadow-sm"
              />
              <div>
                <p className="font-bold text-foreground">{displayName || "Your Name"}</p>
                <p className="text-xs text-muted-foreground/60">This is how others will see you</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading || !displayName.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent-foreground hover:opacity-90 text-primary-foreground font-bold shadow-sm glow-primary transition-all duration-200 active:scale-[0.98]"
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </section>

        {/* Appearance */}
        <section className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center">
              <Palette size={20} className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground">Appearance</h2>
              <p className="text-xs text-muted-foreground">Toggle dark mode using the button in the header</p>
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center">
              <Shield size={20} className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground">Account</h2>
              <p className="text-xs text-muted-foreground">Your account details</p>
            </div>
          </div>
          <div className="bg-secondary/20 rounded-xl px-4 py-3 border border-border/30">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
