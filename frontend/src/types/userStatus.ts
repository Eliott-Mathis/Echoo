export type UserPresence = "online" | "away" | "dnd" | "offline";

export type UserStatus = {
  presence: UserPresence;
  customStatus?: string;
  updatedAt?: string;
  source?: "manual" | "system" | "integration";
  platform?: "web" | "desktop" | "mobile" | "unknown";
};
