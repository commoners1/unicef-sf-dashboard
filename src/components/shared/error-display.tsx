import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  className?: string;
}

export function ErrorDisplay({ error, className = '' }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className={`bg-destructive/10 border border-destructive/20 rounded-md p-3 sm:p-4 ${className}`}>
      <div className="flex">
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="ml-2 sm:ml-3 min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm font-medium text-destructive">Error</h3>
          <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-destructive/90 break-words">{error}</div>
        </div>
      </div>
    </div>
  );
}

