"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/server/better-auth/client";
import { api } from "@/trpc/react";

export default function AdminPageClient() {
  const [maxUsers, setMaxUsers] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // tRPC hooks
  const {
    data: config,
    refetch: refetchConfig,
    isLoading: configLoading,
  } = api.admin.getConfig.useQuery();
  const { data: users, isLoading: usersLoading } =
    api.admin.getUsers.useQuery();
  const { data: userCount, isLoading: userCountLoading } =
    api.admin.getUserCount.useQuery();

  const updateMaxUsersMutation = api.admin.updateMaxUsers.useMutation({
    onSuccess: () => {
      refetchConfig();
    },
  });

  const toggleSignupMutation = api.admin.toggleSignup.useMutation({
    onSuccess: () => {
      refetchConfig();
    },
  });

  // Initialize form with current config
  useEffect(() => {
    if (config?.maxUsers) {
      setMaxUsers(config.maxUsers);
    }
  }, [config]);

  const handleUpdateMaxUsers = () => {
    if (maxUsers) {
      updateMaxUsersMutation.mutate({ maxUsers });
    }
  };

  const handleToggleSignup = (enabled: boolean) => {
    toggleSignupMutation.mutate({ enabled });
  };

  return (
    <div className="container mx-auto py-8 px-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage application settings and user limits
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Management Section */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxUsers">Maximum Users</Label>
                <div className="flex gap-2 mt-1">
                  {configLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id="maxUsers"
                      type="number"
                      placeholder="Enter max users"
                      value={maxUsers}
                      onChange={(e) => setMaxUsers(e.target.value)}
                    />
                  )}
                  <Button
                    onClick={handleUpdateMaxUsers}
                    disabled={updateMaxUsersMutation.isPending}
                  >
                    {updateMaxUsersMutation.isPending
                      ? "Updating..."
                      : "Update"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {configLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <>
                    <Switch
                      id="enableSignup"
                      checked={config?.enableSignup ?? true}
                      onCheckedChange={handleToggleSignup}
                      disabled={toggleSignupMutation.isPending}
                    />
                    <Label htmlFor="enableSignup">Enable User Signup</Label>
                  </>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {userCountLoading || configLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <>
                    Current users: {userCount || 0} /{" "}
                    {config?.maxUsers || "Unlimited"}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                onClick={async () => {
                  if (newPassword !== confirmPassword) {
                    alert("Passwords don't match");
                    return;
                  }

                  try {
                    const result = await authClient.changePassword({
                      newPassword,
                      currentPassword,
                      revokeOtherSessions: true,
                    });

                    if (result.data) {
                      alert("Password changed successfully!");
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    } else {
                      alert("Failed to change password");
                    }
                  } catch (error) {
                    alert("Error changing password");
                  }
                }}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registered Users Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {usersLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                `Registered Users (${users?.length || 0})`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usersLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No users registered yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
