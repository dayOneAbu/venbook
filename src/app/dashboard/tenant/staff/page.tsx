"use client";

import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/_components/ui/card";
import { toast } from "sonner";
import { AddStaffSheet } from "./_components/add-staff-sheet";
import { EditStaffSheet } from "./_components/edit-staff-sheet";
import { useState } from "react";
import FadeContent from "~/_components/FadeContent";
import { DataTable } from "~/_components/ui/data-table";
import { getColumns, type User } from "./columns";

export default function StaffManagementPage() {
  const { data: users, refetch, isLoading } = api.user.getAll.useQuery();

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const deleteUser = api.user.delete.useMutation({
    onSuccess: () => {
      toast.success("Staff member removed");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove staff member");
    },
  });

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to remove ${user.name ?? "this staff member"}?`)) {
      deleteUser.mutate({ id: user.id });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const columns = getColumns({
      onEdit: handleEdit,
      onDelete: handleDelete
  });

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
            <p className="text-muted-foreground">Manage your hotel&apos;s staff members and their access levels.</p>
          </div>
          <AddStaffSheet onUserAdded={() => refetch()} />
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              A list of all staff members currently associated with your hotel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                    Loading staff...
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={users ?? []} 
                    filterColumnName="name"
                    filterPlaceholder="Filter staff..."
                />
            )}
          </CardContent>
        </Card>
      </FadeContent>

      <EditStaffSheet 
        user={editingUser} 
        open={!!editingUser} 
        onOpenChange={(open) => !open && setEditingUser(null)} 
        onUserUpdated={() => refetch()} 
      />
    </div>
  );
}
