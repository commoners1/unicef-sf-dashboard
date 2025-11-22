import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnvironmentSelector } from '@/components/shared/environment-selector';
import { useDashboardStore } from '@/features/dashboard';
import { useAuthStore } from '@/features/auth';
import { formatRoleName } from '@/lib/utils';
import { Menu, Bell, User, Moon, Sun, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { toggleSidebar, setSidebarOpen, sidebarOpen, theme, toggleTheme } = useDashboardStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuClick = () => {
    // Check if we're on mobile/tablet (lg breakpoint is 1024px)
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    
    if (isMobile) {
      // On mobile/tablet, toggle overlay sidebar
      setSidebarOpen(!sidebarOpen);
    } else {
      // On desktop, toggle collapsed state
      toggleSidebar();
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="flex h-14 sm:h-16 items-center px-2 sm:px-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMenuClick}
            className="h-8 w-8"
            aria-label="Toggle menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate max-w-[160px] sm:max-w-none">
              Salesforce Middleware
            </h1>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              v1.1.0
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-2 md:space-x-4">
          {/* Environment Selector - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block">
            <EnvironmentSelector />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications - Hidden on mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hidden sm:inline-flex"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="User menu">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name || 'User'}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRoleName(user?.role)}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              {/* Show environment selector in dropdown on mobile */}
              <div className="md:hidden px-2 py-1">
                <EnvironmentSelector />
              </div>
              <div className="md:hidden">
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
