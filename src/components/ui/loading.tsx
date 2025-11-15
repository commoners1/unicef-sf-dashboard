import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({
  variant = 'spinner',
  size = 'md',
  text,
  fullScreen = false,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const renderSpinner = () => (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
  );

  const renderDots = () => (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className={cn('rounded-full bg-primary animate-bounce', sizeClasses[size])} style={{ animationDelay: '0ms' }}></div>
      <div className={cn('rounded-full bg-primary animate-bounce', sizeClasses[size])} style={{ animationDelay: '150ms' }}></div>
      <div className={cn('rounded-full bg-primary animate-bounce', sizeClasses[size])} style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  const renderPulse = () => (
    <div className={cn('rounded-full bg-primary animate-pulse', sizeClasses[size], className)}></div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return (
          <div className={cn('space-y-2', className)}>
            <div className="h-4 bg-muted rounded animate-pulse w-48"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-40"></div>
          </div>
        );
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderContent()}
      {text && (
        <p className={cn('text-muted-foreground font-medium', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted rounded';

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, 'h-4')}
            style={{
              width: i === lines - 1 ? '60%' : width || '100%',
            }}
          />
        ))}
      </div>
    );
  }

  const shapeClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  return (
    <div
      className={cn(baseClasses, shapeClasses[variant], className)}
      style={{
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'circular' ? width : '1rem'),
      }}
    />
  );
}

// Full page loading component
interface PageLoadingProps {
  text?: string;
  subtitle?: string;
}

export function PageLoading({ text = 'Loading...', subtitle }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20">
          <Loader2 className="h-12 w-12 text-primary" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-lg font-semibold text-foreground">{text}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Inline loading component
interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InlineLoading({ text, size = 'md' }: InlineLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

