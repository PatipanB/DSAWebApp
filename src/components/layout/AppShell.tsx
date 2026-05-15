import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export function AppShell() {
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
