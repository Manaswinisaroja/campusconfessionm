import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));
    const type = hashParams.get("type");
    if (type === "recovery") {
      setReady(true);
    } else {
      toast.error("Invalid or expired reset link.");
      navigate("/login");
    }
  }, [navigate]);

  const handleUpdate = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully!");
    navigate("/");
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4">
        <h1 className="font-display text-2xl font-bold text-card-foreground">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password below.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full px-3.5 py-2.5 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="w-full px-3.5 py-2.5 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </div>
    </div>
  );
}
