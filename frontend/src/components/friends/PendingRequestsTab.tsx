import { useCallback, useEffect, useState } from 'react';
import { acceptFriendRequest, declineFriendRequest, getPendingFriendRequests } from '@/api/relationships.api';
import type { PendingFriendRequest } from '@/types/relationships';
import socket from '@/lib/socket';
import { toUserStatus } from '@/lib/relationshipUtils';
import StatusBadge from '@/components/friends/StatusBadge';

export default function PendingRequestsTab() {
  const [pending, setPending] = useState<PendingFriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyUserIds, setBusyUserIds] = useState<Set<string>>(new Set());

  const loadPending = useCallback(async () => {
    try {
      const data = await getPendingFriendRequests();
      setPending(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();

    const handleRefresh = () => {
      loadPending();
    };

    socket.on('friend:pending-updated', handleRefresh);
    socket.on('friend:list-updated', handleRefresh);
    return () => {
      socket.off('friend:pending-updated', handleRefresh);
      socket.off('friend:list-updated', handleRefresh);
    };
  }, [loadPending]);

  const setBusy = (userId: string, value: boolean) => {
    setBusyUserIds((prev) => {
      const next = new Set(prev);
      if (value) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  };

  const handleAccept = async (userId: string) => {
    setBusy(userId, true);
    try {
      await acceptFriendRequest(userId);
      await loadPending();
    } finally {
      setBusy(userId, false);
    }
  };

  const handleDecline = async (userId: string) => {
    setBusy(userId, true);
    try {
      await declineFriendRequest(userId);
      await loadPending();
    } finally {
      setBusy(userId, false);
    }
  };

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Pending</h1>
      </div>
      {isLoading ? (
        <p className="text-sm text-neutral-medium">Loading pending requests...</p>
      ) : pending.length === 0 ? (
        <p className="text-sm text-neutral-medium">No pending requests.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((request) => {
            const friend = request.owner;
            const isBusy = busyUserIds.has(friend.id);
            const status = toUserStatus(friend.status, friend.customStatus);
            return (
              <div key={request.id} className="flex items-center justify-between gap-4 rounded-lg border border-border-primary px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {friend.avatarUrl ? <img src={friend.avatarUrl} alt={friend.displayName} className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-neutral-low flex items-center justify-center text-sm font-semibold text-neutral-highest">{(friend.displayName || friend.username).charAt(0).toUpperCase()}</div>}
                    <StatusBadge presence={status.presence} className="absolute bottom-0 right-0 border-2 border-darkblue-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-highest">{friend.displayName || friend.username}</span>
                    <span className="text-xs text-neutral-medium">@{friend.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleAccept(friend.id)} disabled={isBusy} className="px-3 py-1.5 rounded-md text-sm font-semibold bg-success-medium text-success-lowest hover:bg-success-high disabled:opacity-60">
                    Accept
                  </button>
                  <button type="button" onClick={() => handleDecline(friend.id)} disabled={isBusy} className="px-3 py-1.5 rounded-md text-sm font-semibold bg-danger-medium text-danger-lowest hover:bg-danger-high disabled:opacity-60">
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
