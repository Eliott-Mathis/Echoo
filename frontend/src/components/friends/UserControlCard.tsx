import { Link } from "react-router-dom";
import { Headphones, Mic, Settings } from "lucide-react";
import StatusBadge from "@/components/friends/StatusBadge";
import { authClient } from "@/lib/authClient";

type UserControlCardProps = {
  name?: string;
  username?: string;
  avatarUrl?: string;
  presence?: "online" | "away" | "dnd" | "offline";
};

export default function UserControlCard({
  name,
  username,
  avatarUrl,
  presence = "online",
}: UserControlCardProps) {
  const { data } = authClient.useSession();
  const sessionUser = data?.user as
    | {
        name?: string;
        username?: string;
        email?: string;
        image?: string;
        avatarUrl?: string;
        presence?: "online" | "away" | "dnd" | "offline";
      }
    | undefined;

  console.log("UserControlCard sessionUser:", sessionUser);

  const resolvedName =
    name ?? sessionUser?.name ?? "Unknown";
  const resolvedUsername =
    username ?? sessionUser?.username ?? "unknown";
  const resolvedAvatarUrl =
    avatarUrl ?? sessionUser?.avatarUrl ?? sessionUser?.image ?? undefined;
  const resolvedPresence = presence ?? sessionUser?.presence ?? "online";

  const fallbackSource = (resolvedName || resolvedUsername || "U").trim();
  const fallbackInitial = (fallbackSource.charAt(0) || "U").toUpperCase();

  return (
    <div className="mt-auto rounded-2xl border border-border-primary bg-background-secondary px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            {resolvedAvatarUrl ? (
              <img
                src={resolvedAvatarUrl}
                alt={resolvedName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-neutral-low flex items-center justify-center text-sm font-semibold text-neutral-highest">
                {fallbackInitial}
              </div>
            )}
            <StatusBadge
              presence={resolvedPresence}
              size={14}
              className="absolute bottom-0 right-0 border-2 border-background-secondary"
            />
          </div>
          <div className="flex flex-col min-w-0 max-w-full overflow-hidden">
            <span className="text-sm font-semibold text-neutral-highest truncate max-w-full">
              {resolvedName}
            </span>
            <span className="text-xs text-neutral-medium truncate max-w-full">
              @{resolvedUsername}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-neutral-medium hover:text-neutral-highest hover:bg-neutral-lower transition-colors"
            aria-label="Toggle microphone"
          >
            <Mic size={16} className="mx-auto" />
          </button>
          <button
            type="button"
            className="text-neutral-medium hover:text-neutral-highest hover:bg-neutral-lower transition-colors"
            aria-label="Toggle headset"
          >
            <Headphones size={16} className="mx-auto" />
          </button>
          <Link
            to="/settings"
            className="text-neutral-medium hover:text-neutral-highest hover:bg-neutral-lower transition-colors flex items-center justify-center"
            aria-label="Open settings"
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
