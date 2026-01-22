import { apiClient } from '@/api/client';
import type { PendingFriendRequest, RelationshipUser } from '@/types/relationships';

type PendingCountResponse = {
  pendingCount: number;
};

export const getPendingFriendRequestCount = async () => {
  const { data } = await apiClient.get<PendingCountResponse>('/api/relationships/pending-count');
  return data.pendingCount;
};

type PendingListResponse = {
  pending: PendingFriendRequest[];
};

type FriendsListResponse = {
  friends: RelationshipUser[];
};

export const getPendingFriendRequests = async () => {
  const { data } = await apiClient.get<PendingListResponse>('/api/relationships/pending');
  return data.pending;
};

export const getFriends = async () => {
  const { data } = await apiClient.get<FriendsListResponse>('/api/relationships/friends');
  return data.friends;
};

export const acceptFriendRequest = async (userId: string) => {
  const { data } = await apiClient.post<{ friend: RelationshipUser }>('/api/relationships/accept', { userId });
  return data.friend;
};

export const declineFriendRequest = async (userId: string) => {
  await apiClient.post('/api/relationships/decline', { userId });
};
