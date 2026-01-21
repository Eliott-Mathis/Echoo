import { NavLink } from "react-router-dom";
import type { UserStatus } from "@/types/userStatus";
import StatusBadge from "@/components/friends/StatusBadge";

interface FriendListItemProps {
  name: string;
  status?: UserStatus;
  customStatus?: string;
  avatarUrl?: string;
  isActive?: boolean;
  to?: string;
}

export default function FriendListItem({
  name,
  status,
  customStatus,
  avatarUrl,
  isActive = false,
  to,
}: FriendListItemProps) {
  const fallbackInitial = name.trim().charAt(0).toUpperCase();
  const presence = status?.presence ?? "offline";
  const displayedStatus = status?.customStatus ?? customStatus;
  const containerClasses = (active: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
      active ? "bg-neutral-lower" : "bg-transparent"
    } hover:bg-neutral-lower`;

  const content = (
    <>
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
          className="absolute bottom-0 right-0 border-2 border-darkblue-400"
        />
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-sm text-neutral-highest truncate">
          {name}
        </span>
        {displayedStatus && (
          <span className="text-xs text-neutral-medium truncate">{displayedStatus}</span>
        )}
      </div>
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive: navActive }) =>
          containerClasses(isActive || navActive)
        }
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button className={containerClasses(isActive)} type="button">
      {content}
    </button>
  );
}
