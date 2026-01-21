export type DirectMessage = {
  id: string;
  author: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  isSelf?: boolean;
};
