import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import type { User } from '@/types';
import { UserApiService } from '@/services/api/users/user-api';
import { 
  Plus, 
  Users, 
  Key, 
  Shield, 
  Eye, 
  Download,
  RefreshCw,
  Building,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await UserApiService.getAllUsers(page, limit);
      
      setUsers(response.users);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
      setUsers([]);
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };


  const activeUsers = users.filter(user => user.isActive).length;
  const totalApiKeys = users.reduce((sum, user) => sum + (user.apiKeyCount || 0), 0);
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const operatorUsers = users.filter(u => u.role === 'operator').length;
  const viewerUsers = users.filter(u => u.role === 'viewer').length;

  const handleRefresh = async () => {
    await loadUsers(pagination.current, pagination.pageSize);
  };

  const handleView = (_user: User) => {
    // TODO: Open user details modal
  };

  const handleEdit = (_user: User) => {
    // TODO: Open edit modal
  };

  const handleDelete = (_user: User) => {
    // TODO: Show confirmation dialog
  };

  const handleExport = (user?: User) => {
    if (user) {
      const data = JSON.stringify(user, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-${user.id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      const csvContent = [
        'ID,Name,Email,Company,Role,Active,Created At,Last Login',
        ...users.map(user => [
          user.id,
          user.name,
          user.email,
          user.company || '',
          user.role,
          user.isActive ? 'Yes' : 'No',
          new Date(user.createdAt).toLocaleString(),
          user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handlePageChange = (page: number) => {
    loadUsers(page, pagination.pageSize);
  };


  const handleFilterChange = (_filters: any) => {
    // TODO: Implement filtering
  };

  const handleSearch = (_searchTerm: string) => {
    // TODO: Implement search
  };

  const ROLE_LABELS: Record<string, string> = {
    'SUPER_ADMIN': 'Super Admin',
    'ADMIN': 'Admin',
    'USER': 'User',
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      title: 'User',
      dataIndex: 'name',
      sortable: true,
      filterable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      title: 'Company',
      dataIndex: 'company',
      sortable: true,
      filterable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{user.company || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'All Roles', value: '' },
        { label: 'Super Admin', value: 'SUPER_ADMIN' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'User', value: 'USER' },
      ],
      render: (_, user) => {
        const getRoleVariant = (role: string) => {
          switch (role) {
            case 'SUPER_ADMIN': return 'destructive';
            case 'ADMIN': return 'secondary';
            case 'USER': return 'outline';
            default: return 'outline';
          }
        };

        return (
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <Badge variant={getRoleVariant(user.role)}>
              {ROLE_LABELS[user.role] || (user.role ? user.role[0].toUpperCase() + user.role.slice(1).toLowerCase() : 'User')}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'apiKeyCount',
      title: 'API Keys',
      dataIndex: 'apiKeyCount',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono">{user.apiKeyCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      dataIndex: 'isActive',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'All', value: '' },
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ],
      render: (_, user) => (
        <Badge variant={user.isActive ? 'default' : 'secondary'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      dataIndex: 'lastLogin',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and API key access
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleExport()}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers} active users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApiKeys}</div>
            <p className="text-xs text-muted-foreground">
              Total active keys
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              Full access users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operatorUsers}</div>
            <p className="text-xs text-muted-foreground">
              Limited access users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viewers</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewerUsers}</div>
            <p className="text-xs text-muted-foreground">
              Read-only users
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        onPaginationChange={handlePageChange}
        onSort={(_field, _direction) => {
          // TODO: Implement sorting
        }}
        onFilter={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Search users by name, email, or company..."
        actions={{
          view: handleView,
          edit: handleEdit,
          delete: handleDelete,
          export: handleExport,
        }}
        rowKey="id"
        emptyMessage="No users found"
        serverSidePagination={true}
      />
    </div>
  );
}

