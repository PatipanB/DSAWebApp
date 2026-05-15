import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useTopicStore } from '@/store/topicStore';
import { TOPICS } from '@/data/topics';

export function AppShell() {
  const { pathname } = useLocation();
  const setSelected = useTopicStore((s) => s.setSelectedTopicId);
  useEffect(() => {
    const match = TOPICS.find((t) => t.path === pathname);
    setSelected(match?.id ?? null);
  }, [pathname, setSelected]);

  return (
    <div className="grid grid-rows-[auto_1fr] h-full">
      <TopBar />
      <div className="grid grid-cols-[260px_1fr] min-h-0">
        <Sidebar />
        <main className="overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
