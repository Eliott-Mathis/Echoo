import { useCallback, useEffect, useMemo, useState } from 'react';
import FriendListItem from '@/components/friends/FriendListItem';
import { getFriends } from '@/api/relationships.api';
import type { RelationshipUser } from '@/types/relationships';
import socket from '@/lib/socket';
import { toUserStatus } from '@/lib/relationshipUtils';

type FriendsListTabProps = {
  title: string;
  mode: 'online' | 'all';
};

export default function FriendsListTab({ title, mode }: FriendsListTabProps) {
  const [friends, setFriends] = useState<RelationshipUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    try {
      const data = await getFriends();
      setFriends(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();

    const handleRefresh = () => {
      loadFriends();
    };

    socket.on('friend:list-updated', handleRefresh);
    return () => {
      socket.off('friend:list-updated', handleRefresh);
    };
  }, [loadFriends]);

  const filteredFriends = useMemo(() => {
    if (mode === 'all') return friends;
    return friends.filter((friend) => {
      const presence = toUserStatus(friend.status, friend.customStatus).presence;
      return presence !== 'offline';
    });
  }, [friends, mode]);

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      {isLoading ? (
        <p className="text-sm text-neutral-medium">Loading friends...</p>
      ) : filteredFriends.length === 0 ? (
        <p className="text-sm text-neutral-medium">No friends found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredFriends.map((friend) => (
            <FriendListItem key={friend.id} name={friend.displayName || friend.username} status={toUserStatus(friend.status, friend.customStatus)} avatarUrl={friend.avatarUrl ?? undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
