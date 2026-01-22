import { useCallback, useEffect, useState } from 'react';
import { Rabbit, Search, UsersRound } from 'lucide-react';
import FriendListItem from '@/components/friends/FriendListItem';
import SidebarNavTab from '@/components/friends/SidebarNavTab';
import UserControlCard from '@/components/friends/UserControlCard';
import { getFriends, getPendingFriendRequestCount } from '@/api/relationships.api';
import type { RelationshipUser } from '@/types/relationships';
import socket from '@/lib/socket';
import { toUserStatus } from '@/lib/relationshipUtils';

export default function FriendsSidebar() {
  const dmPathFor = (name: string) => `/messages/${encodeURIComponent(name)}`;
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [friends, setFriends] = useState<RelationshipUser[]>([]);

  const loadPendingCount = useCallback(async () => {
    try {
      const count = await getPendingFriendRequestCount();
      setPendingCount(count);
    } catch {
      setPendingCount(null);
    }
  }, []);

  const loadFriends = useCallback(async () => {
    try {
      const data = await getFriends();
      setFriends(data);
    } catch {
      setFriends([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      await Promise.all([loadPendingCount(), loadFriends()]);
    };

    const handlePendingUpdate = () => {
      if (!isMounted) return;
      loadPendingCount();
    };

    const handleFriendsUpdate = () => {
      if (!isMounted) return;
      loadFriends();
    };

    bootstrap();

    socket.on('friend:pending-updated', handlePendingUpdate);
    socket.on('friend:list-updated', handleFriendsUpdate);

    return () => {
      isMounted = false;
      socket.off('friend:pending-updated', handlePendingUpdate);
      socket.off('friend:list-updated', handleFriendsUpdate);
    };
  }, [loadFriends, loadPendingCount]);

  return (
    <aside className="w-72 bg-darkblue-400 border-r border-input-primary-default-border flex flex-col gap-4 p-4">
      <label className="relative flex items-center gap-2 bg-neutral-lowest border border-input-primary-default-border rounded-md px-3 py-2">
        <Search size={16} className="text-input-primary-default-icon" />
        <input type="text" placeholder="Search for a conversation" className="w-full bg-transparent text-sm text-input-primary-default-text placeholder:text-input-primary-default-placeholder outline-none" />
      </label>
      <div className="flex flex-col gap-2 flex-1">
        <div className="tabs mt-2 mb-4 flex flex-col gap-2">
          <SidebarNavTab to="/friends/addfriend" label="Friends" icon={UsersRound} badgeCount={typeof pendingCount === 'number' && pendingCount > 0 ? pendingCount : undefined} />
          <SidebarNavTab to="/dynamite" label="Dynamite" icon={Rabbit} />
        </div>
        <span className="text-xs font-semibold uppercase text-neutral-medium tracking-wider px-2">Direct Messages</span>
        {friends.length === 0 ? <span className="text-xs text-neutral-medium px-2">No friends yet.</span> : friends.map((friend) => <FriendListItem key={friend.id} name={friend.displayName || friend.username} status={toUserStatus(friend.status, friend.customStatus)} avatarUrl={friend.avatarUrl ?? undefined} to={dmPathFor(friend.username)} isActive={false} />)}
      </div>
      <UserControlCard />
    </aside>
  );
}
