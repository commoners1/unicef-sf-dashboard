import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'h-12 sm:h-14',
        'flex items-center justify-center',
        'px-2 sm:px-4',
        'text-xs sm:text-sm text-muted-foreground',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center w-full max-w-7xl gap-1 sm:gap-2">
        <p className="text-center">
          © {currentYear} Salesforce Middleware. All rights reserved.
          <span className="hidden sm:inline"> • Version 1.3.1</span>
        </p>
      </div>
    </footer>
  );
}

