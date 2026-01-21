import { useState } from "react";
import { authClient } from "@/lib/authClient";
import { UsersRound } from "lucide-react";

// Components
import ServerList from "@/components/ServerList";
import FriendsSidebar from "@/components/friends/FriendsSidebar";
import AddFriendTab from "@/components/friends/AddFriendTab";
import FriendsListTab from "@/components/friends/FriendsListTab";

const topTabs = ["Online", "All", "Pending", "Blocked", "Add Friend"] as const;
type TopTab = (typeof topTabs)[number];

export default function Home() {
  const { data, isPending, error } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<TopTab>("Add Friend");

  if (isPending) return <p>Loading...</p>;
  if (error) return <p>Erreur</p>;
  if (!data?.user) return <p>Non connecté</p>;

  function handleTabChange(
    e: React.MouseEvent<HTMLButtonElement>,
    tab: TopTab
  ) {
    e.preventDefault();
    setActiveTab(tab);
  }

  return (
    <div className="min-h-screen flex bg-background-primary text-neutral-highest">
      <aside className="bg-darkblue-400 border-r border-border-primary">
        <ServerList />
      </aside>
      <div className="flex flex-1">
        <FriendsSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b border-border-primary px-6 py-4 flex items-center gap-2">
            <div className="flex items-center gap-2 text-neutral-highest">
              <UsersRound size={18} className="text-neutral-highest" />
              <span className="text-sm font-semibold">Friends</span>
            </div>
            <nav className="ml-6 flex items-center gap-1">
              {topTabs.map((tab) => {
                const isActive = tab === activeTab;
                const baseClasses =
                  "text-sm font-semibold px-3 py-1 rounded-md transition-colors whitespace-nowrap";
                const activeClasses =
                  "text-orange-500 bg-orange-100 hover:bg-orange-200";
                let inactiveClasses =
                  "hover:text-neutral-highest hover:bg-neutral-lower";

                inactiveClasses += (tab === "Add Friend" ? " text-success-medium hover:bg-success-low transition-colors" : " text-neutral-medium");

                return (
                  <button
                    key={tab}
                    type="button"
                    className={`${baseClasses} ${
                      isActive ? activeClasses : inactiveClasses
                    }`}
                    onClick={(e) => handleTabChange(e, tab)}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          </header>
          <section className="flex-1 px-10 py-8">
            {activeTab !== "Add Friend" ? (
              <FriendsListTab title={activeTab} />
            ) : (
              <AddFriendTab />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
