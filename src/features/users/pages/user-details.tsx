import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserApiService, type User } from '@/services/api/users/user-api';
import { PageLoading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { formatRoleName } from '@/lib/utils';

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    UserApiService.getUserById(id)
      .then(setUser)
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Details</h1>
        </div>
        <PageLoading text="Loading user details" subtitle="Fetching user information" />
      </div>
    );
  }
  if (error || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Details</h1>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'User not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="max-w-xl mx-auto mt-8 space-y-6">
      <Link className="text-blue-600 hover:underline" to="/users">&larr; Back to Users</Link>
      <div className="text-2xl font-bold">User Details</div>
      <div className="space-y-2 p-4 rounded shadow bg-card">
        <div><strong>Name:</strong> {user.name || '-'}</div>
        <div><strong>Email:</strong> {user.email || '-'}</div>
        <div><strong>Company:</strong> {user.company || '-'}</div>
        <div><strong>Role:</strong> {formatRoleName(user.role)}</div>
        <div><strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}</div>
        <div><strong>API Keys:</strong> {user.apiKeyCount || 0}</div>
        <div><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</div>
        <div><strong>Created At:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</div>
      </div>
    </div>
  );
}

