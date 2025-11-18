import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLoading } from '@/components/ui/loading';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import ErrorsApiService, { type Error } from '@/services/api/errors/errors-api';

export default function ErrorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [errorData, setErrorData] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ErrorsApiService.getErrorById(id)
      .then(setErrorData)
      .catch(() => setError('Error not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Error Details</h1>
        </div>
        <PageLoading text="Loading error details" subtitle="Fetching error information" />
      </div>
    );
  }

  if (error || !errorData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Error Details</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Error not found'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-primary hover:underline inline-flex items-center gap-2 mb-4" to="/errors">
          &larr; Back to Errors
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Error Details</h1>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4">
            <div>
              <strong className="text-sm font-medium text-muted-foreground">Message:</strong>
              <p className="mt-1">{errorData.message || '-'}</p>
            </div>
            <div>
              <strong className="text-sm font-medium text-muted-foreground">Type:</strong>
              <p className="mt-1">{errorData.type}</p>
            </div>
            <div>
              <strong className="text-sm font-medium text-muted-foreground">Source:</strong>
              <p className="mt-1">{errorData.source}</p>
            </div>
            <div>
              <strong className="text-sm font-medium text-muted-foreground">Resolved:</strong>
              <p className="mt-1">{errorData.resolved ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <strong className="text-sm font-medium text-muted-foreground">Occurrences:</strong>
              <p className="mt-1">{errorData.occurrences}</p>
            </div>
            <div>
              <strong className="text-sm font-medium text-muted-foreground">First Seen:</strong>
              <p className="mt-1">{errorData.firstSeen ? new Date(errorData.firstSeen).toLocaleString() : '-'}</p>
            </div>
            <div>
              <strong className="text-sm font-medium text-muted-foreground">Last Seen:</strong>
              <p className="mt-1">{errorData.lastSeen ? new Date(errorData.lastSeen).toLocaleString() : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
