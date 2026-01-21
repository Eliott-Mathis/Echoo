import { Link } from "react-router-dom";
import { Headphones, Mic, Settings } from "lucide-react";
import StatusBadge from "@/components/friends/StatusBadge";

type UserControlCardProps = {
  name: string;
  username: string;
  avatarUrl?: string;
  presence?: "online" | "away" | "dnd" | "offline";
};

export default function UserControlCard({
  name,
  username,
  avatarUrl,
  presence = "online",
}: UserControlCardProps) {
  const fallbackInitial = name.trim().charAt(0).toUpperCase();

  return (
    <div className="mt-auto rounded-2xl border border-border-primary bg-background-secondary px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-neutral-low flex items-center justify-center text-sm font-semibold text-neutral-highest">
                {fallbackInitial}
              </div>
            )}
            <StatusBadge
              presence={presence}
              size={14}
              className="absolute bottom-0 right-0 border-2 border-background-secondary"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-neutral-highest truncate">
              {name}
            </span>
            <span className="text-xs text-neutral-medium truncate">
              @{username}
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
