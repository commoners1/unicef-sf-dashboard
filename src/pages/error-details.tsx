import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

  if (loading) return <div className="m-12 text-center">Loading...</div>;
  if (error || !errorData) return <div className="m-12 text-center text-destructive">{error || 'Error not found'}</div>;
  return (
    <div className="max-w-xl mx-auto mt-8 space-y-6">
      <Link className="text-blue-600 hover:underline" to="/errors">&larr; Back to Errors</Link>
      <div className="text-2xl font-bold mb-2">Error Details</div>
      <div className="space-y-2 p-4 rounded shadow bg-card">
        <div><strong>Message:</strong> {errorData.message || '-'}</div>
        <div><strong>Type:</strong> {errorData.type}</div>
        <div><strong>Source:</strong> {errorData.source}</div>
        <div><strong>Resolved:</strong> {errorData.resolved ? 'Yes' : 'No'}</div>
        <div><strong>Occurrences:</strong> {errorData.occurrences}</div>
        <div><strong>First Seen:</strong> {errorData.firstSeen ? new Date(errorData.firstSeen).toLocaleString() : '-'}</div>
        <div><strong>Last Seen:</strong> {errorData.lastSeen ? new Date(errorData.lastSeen).toLocaleString() : '-'}</div>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
}
