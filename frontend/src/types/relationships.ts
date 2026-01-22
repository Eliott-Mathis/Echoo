export type RelationshipUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status?: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DO_NOT_DISTURB' | 'INVISIBLE' | null;
  customStatus?: string | null;
};

export type PendingFriendRequest = {
  id: string;
  createdAt: string;
  owner: RelationshipUser;
};
