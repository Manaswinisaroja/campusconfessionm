import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Check, User } from "lucide-react";
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
      toast.success("Profile updated!");
      navigate("/");
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">Settings</h1>
          <DarkModeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Section */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Customize how you appear on confessions</p>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={30}
              className="bg-secondary/50 border-0"
            />
            <p className="text-xs text-muted-foreground">This name will be shown on your confessions and comments</p>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Choose Avatar</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {AVATAR_OPTIONS.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-110 ${
                    selectedAvatar === avatar
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check size={16} className="text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-3">Preview</p>
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
              <img
                src={selectedAvatar || AVATAR_OPTIONS[0]}
                alt="Preview"
                className="w-10 h-10 rounded-full border border-border"
              />
              <div>
                <p className="font-semibold text-foreground">{displayName || "Your Name"}</p>
                <p className="text-xs text-muted-foreground">This is how others will see you</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading || !displayName.trim()}
            className="w-full"
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </section>

        {/* Account Info */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-display font-semibold text-foreground">Account</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
