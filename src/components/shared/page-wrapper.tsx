import { type ReactNode } from 'react';
import { PageLoading } from '@/components/ui/loading';
import { ErrorDisplay } from './error-display';

interface PageWrapperProps {
  loading?: boolean;
  error?: string | null;
  children: ReactNode;
  loadingText?: string;
  loadingSubtitle?: string;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Reusable wrapper component for pages
 * Handles consistent loading, error, and empty states
 * 
 * @example
 * <PageWrapper loading={loading} error={error}>
 *   <YourPageContent />
 * </PageWrapper>
 */
export function PageWrapper({
  loading = false,
  error = null,
  children,
  loadingText = 'Loading...',
  loadingSubtitle,
  empty = false,
  emptyMessage = 'No data available',
  className = '',
}: PageWrapperProps) {
  if (loading) {
    return (
      <div className={className}>
        <PageLoading text={loadingText} subtitle={loadingSubtitle} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorDisplay error={error} />
      </div>
    );
  }

  if (empty) {
    return (
      <div className={className}>
        <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

