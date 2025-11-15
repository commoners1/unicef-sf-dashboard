import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, Moon, Zap } from 'lucide-react';
import { useDashboardStore } from '@/features/dashboard';

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
          className="h-9 min-w-[140px] md:min-w-[180px] justify-between px-2 md:px-3 py-2 hover:bg-accent/50 transition-colors text-xs md:text-sm"
        >
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex items-center space-x-1 md:space-x-2">
              {getEnvironmentIcon(currentEnvironment.isProduction)}
              <span className="font-medium text-foreground truncate max-w-[80px] md:max-w-none">
                {getEnvironmentName(currentEnvironment.name)}
              </span>
            </div>
            {getEnvironmentBadge(currentEnvironment.isProduction)}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-1">
        {environments.map((env) => {
          const isDisabled = env.id === 'staging' || env.id === 'development';
          return (
            <DropdownMenuItem
              key={env.id}
              onClick={() => !isDisabled && switchEnvironment(env.id)}
              disabled={isDisabled}
              className={`flex items-center justify-between px-3 py-2 rounded-sm ${
                isDisabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:bg-accent/50'
              }`}
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
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

