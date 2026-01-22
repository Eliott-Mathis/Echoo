import type { UserPresence, UserStatus } from '@/types/userStatus';

export const mapPresenceFromStatus = (status?: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DO_NOT_DISTURB' | 'INVISIBLE' | null): UserPresence => {
  switch (status) {
    case 'ONLINE':
      return 'online';
    case 'IDLE':
      return 'away';
    case 'DO_NOT_DISTURB':
      return 'dnd';
    case 'INVISIBLE':
    case 'OFFLINE':
    default:
      return 'offline';
  }
};

export const toUserStatus = (status?: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DO_NOT_DISTURB' | 'INVISIBLE' | null, customStatus?: string | null): UserStatus => ({
  presence: mapPresenceFromStatus(status),
  ...(customStatus ? { customStatus } : {}),
});
