import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
    } else if (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
    }
  }, []);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-xl bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 active:scale-90"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun size={16} className="transition-transform duration-300 rotate-0 hover:rotate-45" /> : <Moon size={16} className="transition-transform duration-300 rotate-0 hover:-rotate-12" />}
    </button>
  );
}
