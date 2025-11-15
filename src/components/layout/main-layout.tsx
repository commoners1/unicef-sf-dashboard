import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useDashboardStore } from '@/features/dashboard';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function MainLayout() {
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen } = useDashboardStore();
  const location = useLocation();

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sidebarOpen && !target.closest('aside') && !target.closest('button[aria-label*="menu" i]')) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sidebarOpen, setSidebarOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-14 sm:pt-16">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={cn(
          'border-r bg-background transition-all duration-300 overflow-y-auto',
          // Mobile: overlay sidebar
          'fixed lg:static inset-y-0 left-0 z-50 lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop: collapsed/expanded
          sidebarCollapsed ? 'w-16' : 'w-64',
          // Mobile: always full width when open
          sidebarOpen && 'w-64'
        )}>
          <Sidebar />
        </aside>
        
        {/* Main Content */}
        <main className={cn(
          'flex-1 overflow-y-auto',
          'p-3 sm:p-4 md:p-6', // Responsive padding
          'w-full'
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
