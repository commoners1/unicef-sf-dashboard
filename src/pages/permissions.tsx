import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, Plus } from 'lucide-react';
import { UserApiService, type User, type AvailableRoles } from '@/services/api/users/user-api';

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<string>('roles');
  const [availableRoles, setAvailableRoles] = useState<AvailableRoles | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('ADMIN');

  const loadData = async () => {
    try {
      const [rolesResp, usersResp] = await Promise.all([
        UserApiService.getAvailableRoles(),
        UserApiService.getAllUsers(1, 50),
      ]);
      setAvailableRoles(rolesResp);
      setUsers(usersResp.users);
    } catch (err) {
      console.error('Permissions load error:', err);
    } finally {
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleChangeUserRole = async (userId: string, role: string) => {
    try {
      await UserApiService.updateUserRole(userId, role);
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)));
    } catch (err) {
      console.error('Update user role error:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Permissions Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage user roles and system permissions
          </p>
        </div>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      {/* Simple Stats using real data */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{availableRoles?.roles.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Selected Role</CardTitle>
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{selectedRole}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Roles</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>User Roles</span>
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Roles List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Available Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {availableRoles?.roles.map((role) => (
                  <div
                    key={role}
                    className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-sm sm:text-base truncate">{role}</h3>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{availableRoles?.descriptions[role]}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Role Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{selectedRole} Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 sm:p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Role Information</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {availableRoles?.descriptions[selectedRole]}
                    </p>
                    <div className="mt-3 flex items-center space-x-4 text-xs sm:text-sm">
                      <span className="text-muted-foreground">
                        System role: <span className="font-medium">{['ADMIN','SUPER_ADMIN','USER'].includes(selectedRole) ? 'Yes' : 'No'}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm sm:text-base">Quick Actions</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Edit Role
                      </Button>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permissions Tab removed – using roles + user assignments */}

        {/* Matrix Tab removed */}

        {/* User Roles Tab */}
        <TabsContent value="users" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">User Role Assignments</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage which users are assigned to which roles
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {availableRoles?.roles.map((role) => (
                  <div key={role} className="p-3 sm:p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">{role}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{availableRoles?.descriptions[role]}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs sm:text-sm flex-shrink-0 w-fit">
                        {users.filter(u => u.role === role).length} users
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      <p className="mb-2">Users assigned to this role:</p>
                      <div className="space-y-2">
                        {users.filter(u => u.role === role).length > 0 ? (
                          users
                            .filter(u => u.role === role)
                            .map((u) => (
                              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 bg-muted/50 rounded-md">
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs sm:text-sm font-medium block truncate">{u.name}</span>
                                  <span className="text-xs text-muted-foreground block truncate">{u.email}</span>
                                </div>
                                <div className="flex-shrink-0">
                                  <select
                                    className="text-xs sm:text-sm border rounded px-2 py-1.5 sm:px-3 sm:py-2 w-full sm:w-auto bg-background"
                                    value={u.role}
                                    onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                                  >
                                    {availableRoles?.roles.map((r) => (
                                      <option key={r} value={r}>{r}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-xs sm:text-sm text-muted-foreground py-2">No users assigned</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
