import { Outlet } from "react-router-dom";
import { authClient } from "@/lib/authClient";

import ServerList from "@/components/ServerList";
import FriendsSidebar from "@/components/friends/FriendsSidebar";

export default function Home() {
  const { data, isPending, error } = authClient.useSession();

  if (isPending) return <p>Loading...</p>;
  if (error) return <p>Erreur</p>;
  if (!data?.user) return <p>Non connecté</p>;

  return (
    <div className="min-h-screen flex bg-background-primary text-neutral-highest">
      <aside className="bg-darkblue-400 border-r border-border-primary">
        <ServerList />
      </aside>
      <div className="flex flex-1">
        <FriendsSidebar />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
