import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Moon, Zap } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboard-store';

export function EnvironmentSelector() {
  const { currentEnvironment, environments, switchEnvironment } = useDashboardStore();

  const getEnvironmentIcon = (isProduction: boolean) => {
    return isProduction ? <Zap className="h-4 w-4" /> : <Moon className="h-4 w-4" />;
  };

  const getEnvironmentBadge = (isProduction: boolean) => {
    return (
      <Badge 
        variant={isProduction ? 'destructive' : 'secondary'}
        className={`text-xs font-medium ${
          isProduction 
            ? 'bg-red-100 text-red-700 border-red-200' 
            : 'bg-blue-100 text-blue-700 border-blue-200'
        }`}
      >
        {isProduction ? 'PROD' : 'STAGING'}
      </Badge>
    );
  };

  const getEnvironmentName = (name: string) => {
    // Remove "Environment" from the name to avoid redundancy
    return name.replace(' Environment', '');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-9 min-w-[180px] justify-between px-3 py-2 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getEnvironmentIcon(currentEnvironment.isProduction)}
              <span className="text-sm font-medium text-foreground">
                {getEnvironmentName(currentEnvironment.name)}
              </span>
            </div>
            {getEnvironmentBadge(currentEnvironment.isProduction)}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-1">
        {environments.map((env) => (
          <DropdownMenuItem
            key={env.id}
            onClick={() => switchEnvironment(env.id)}
            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent/50 rounded-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getEnvironmentIcon(env.isProduction)}
                <span className="text-sm font-medium">
                  {getEnvironmentName(env.name)}
                </span>
              </div>
              {getEnvironmentBadge(env.isProduction)}
            </div>
            {currentEnvironment.id === env.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
