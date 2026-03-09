const BANNED_WORDS = [
  "fuck", "shit", "bitch", "damn", "bastard", "dick", "cunt",
  "nigger", "nigga", "faggot", "retard", "slut", "whore",
  "kill yourself", "kys",
];

export function containsBannedWords(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => {
    // Use word boundary matching to avoid false positives like "class" matching "ass"
    const regex = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    return regex.test(lower);
  });
}
