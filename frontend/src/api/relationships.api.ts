import { apiClient } from "@/api/client";

type PendingCountResponse = {
  pendingCount: number;
};

export const getPendingFriendRequestCount = async () => {
  const { data } = await apiClient.get<PendingCountResponse>(
    "/api/relationships/pending-count"
  );
  return data.pendingCount;
};
