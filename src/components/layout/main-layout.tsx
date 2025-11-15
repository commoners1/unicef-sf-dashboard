import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useDashboardStore } from '@/features/dashboard';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { sidebarCollapsed } = useDashboardStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <aside className={cn(
          'border-r bg-background transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}>
          <Sidebar />
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
