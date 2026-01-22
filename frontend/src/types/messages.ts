export type DirectMessage = {
  id: string;
  author: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  createdAt?: string | number;
  isSelf?: boolean;
};
