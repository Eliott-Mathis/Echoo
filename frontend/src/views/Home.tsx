import { Outlet } from "react-router-dom";

import ServerList from "@/components/ServerList";
import FriendsSidebar from "@/components/friends/FriendsSidebar";
export default function Home() {
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
