import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UsersRound } from 'lucide-react';

import AddFriendTab from '@/components/friends/AddFriendTab';
import FriendsListTab from '@/components/friends/FriendsListTab';
import PendingRequestsTab from '@/components/friends/PendingRequestsTab';

const friendTabs = [
  { label: 'Online', slug: 'online' },
  { label: 'All', slug: 'all' },
  { label: 'Pending', slug: 'pending' },
  { label: 'Blocked', slug: 'blocked' },
  { label: 'Add Friend', slug: 'addfriend' },
] as const;

type FriendTabSlug = (typeof friendTabs)[number]['slug'];

type FriendsRouteParams = {
  friendTab?: string;
};

export default function FriendsTab() {
  const navigate = useNavigate();
  const { friendTab } = useParams<FriendsRouteParams>();

  const normalizedTab = (friendTab ?? 'addfriend').toLowerCase();
  const isValidTab = friendTabs.some((tab) => tab.slug === normalizedTab);

  useEffect(() => {
    if (!isValidTab) {
      navigate('/friends/addfriend', { replace: true });
    }
  }, [isValidTab, navigate]);

  const activeTab = (isValidTab ? normalizedTab : 'addfriend') as FriendTabSlug;

  const mainContent = useMemo(() => {
    switch (activeTab) {
      case 'addfriend':
        return <AddFriendTab />;
      case 'online':
        return <FriendsListTab title="Online" mode="online" />;
      case 'all':
        return <FriendsListTab title="All" mode="all" />;
      case 'pending':
        return <PendingRequestsTab />;
      case 'blocked':
        return (
          <div className="max-w-3xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Blocked</h1>
            </div>
            <p className="text-sm text-neutral-medium">Blocked users list is not implemented yet.</p>
          </div>
        );
      default:
        return <AddFriendTab />;
    }
  }, [activeTab]);

  return (
    <>
      <header className="border-b border-border-primary px-6 py-4 flex items-center gap-2">
        <div className="flex items-center gap-2 text-neutral-highest">
          <UsersRound size={18} className="text-neutral-highest" />
          <span className="text-sm font-semibold">Friends</span>
        </div>
        <nav className="ml-6 flex items-center gap-1">
          {friendTabs.map((tab) => {
            const isActive = tab.slug === activeTab;
            const baseClasses = 'text-sm font-semibold px-3 py-1 rounded-md transition-colors whitespace-nowrap';
            const activeClasses = 'text-orange-500 bg-orange-100 hover:bg-orange-200';
            let inactiveClasses = 'hover:text-neutral-highest hover:bg-neutral-lower';

            inactiveClasses += tab.slug === 'addfriend' ? ' text-success-medium hover:bg-success-low transition-colors' : ' text-neutral-medium';

            return (
              <button key={tab.slug} type="button" className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} onClick={() => navigate(`/friends/${tab.slug}`)}>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>
      <section className="flex-1 px-10 py-8">{mainContent}</section>
    </>
  );
}
