export type DirectMessage = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isSelf?: boolean;
};
