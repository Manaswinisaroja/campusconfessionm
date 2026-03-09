const BANNED_WORDS = [
  "fuck", "shit", "ass", "bitch", "damn", "bastard", "dick", "cunt",
  "nigger", "nigga", "faggot", "retard", "slut", "whore",
  "kill yourself", "kys",
];

export function containsBannedWords(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word));
}
