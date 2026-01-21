import { Rabbit, Search, UsersRound } from "lucide-react";
import FriendListItem from "@/components/friends/FriendListItem";
import SidebarNavTab from "@/components/friends/SidebarNavTab";
import type { UserStatus } from "@/types/userStatus";

const friendItems: Array<{ id: number; name: string; status: UserStatus }> = [
  {
    id: 1,
    name: "Théo",
    status: {
      presence: "online",
      customStatus: "Playing Visual Studio Code",
      platform: "desktop",
    },
  },
  {
    id: 2,
    name: "Eliott",
    status: {
      presence: "online",
      platform: "web",
    },
  },
  {
    id: 3,
    name: "Excalibur//",
    status: {
      presence: "dnd",
      platform: "desktop",
    },
  },
  {
    id: 4,
    name: "Jerry",
    status: {
      presence: "away",
      platform: "mobile",
    },
  },
  {
    id: 5,
    name: "Bugatti",
    status: {
      presence: "offline",
    },
  },
  {
    id: 6,
    name: "Izuku",
    status: {
      presence: "online",
      customStatus: "Playing Valorant",
      platform: "desktop",
    },
  },
  {
    id: 7,
    name: "Chakal98",
    status: {
      presence: "offline",
    },
  },
  {
    id: 8,
    name: "EasternBunny913",
    status: {
      presence: "offline",
    },
  },
  {
    id: 9,
    name: "Hichlocal",
    status: {
      presence: "offline",
    },
  },
];

export default function FriendsSidebar() {
  const dmPathFor = (name: string) => `/messages/${encodeURIComponent(name)}`;

  return (
    <aside className="w-72 bg-darkblue-400 border-r border-input-primary-default-border flex flex-col gap-4 p-4">
      <label className="relative flex items-center gap-2 bg-neutral-lowest border border-input-primary-default-border rounded-md px-3 py-2">
        <Search size={16} className="text-input-primary-default-icon" />
        <input
          type="text"
          placeholder="Search for a conversation"
          className="w-full bg-transparent text-sm text-input-primary-default-text placeholder:text-input-primary-default-placeholder outline-none"
        />
      </label>
      <div className="flex flex-col gap-2">
        <div className="tabs mt-2 mb-4 flex flex-col gap-2">
          <SidebarNavTab
            to="/friends/addfriend"
            label="Friends"
            icon={UsersRound}
            badgeCount={5}
          />
          <SidebarNavTab
            to="/dynamite"
            label="Dynamite"
            icon={Rabbit}
          />
        </div>
        <span className="text-xs font-semibold uppercase text-neutral-medium tracking-wider px-2">
          Direct Messages
        </span>
        {friendItems.map((friend) => (
          <FriendListItem
            key={friend.id}
            name={friend.name}
            status={friend.status}
            to={dmPathFor(friend.name)}
            isActive={false}
          />
        ))}
      </div>
    </aside>
  );
}
