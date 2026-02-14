"use client";

import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "~/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/_components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/_components/ui/table";
import { Badge } from "~/_components/ui/badge";
import { Trash2, Edit2, MoreHorizontal, Building2 } from "lucide-react";
import { toast } from "sonner";
import { EditStaffSheet } from "./_components/edit-staff-sheet";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/_components/ui/dropdown-menu";
import FadeContent from "~/_components/FadeContent";

type User = RouterOutputs["admin"]["getAllUsers"][number];

export default function PlatformUsersPage() {
  const { data: users, refetch, isLoading } = api.admin.getAllUsers.useQuery();

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteUser = api.user.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const handleDelete = (id: string, name: string | null) => {
    if (confirm(`Are you sure you want to remove ${name ?? "this user"}?`)) {
      deleteUser.mutate({ id });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "default";
      case "HOTEL_ADMIN":
        return "default";
      case "SALES":
        return "secondary";
      case "OPERATIONS":
        return "outline";
      case "FINANCE":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">Manage all users across the platform.</p>
          </div>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              A complete list of all users registered on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          {user.isOnboarded && (
                            <span className="text-xs text-muted-foreground italic">Onboarded</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.hotel ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{user.hotel.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Platform Only</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.emailVerified ? "outline" : "secondary"} className={user.emailVerified ? "bg-green-50 text-green-700 border-green-200" : ""}>
                          {user.emailVerified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleDelete(user.id, user.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!isLoading && !users?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </FadeContent>

      <EditStaffSheet 
        user={editingUser as { id: string; name: string | null; role: "HOTEL_ADMIN" | "SALES" | "OPERATIONS" | "FINANCE" | "CUSTOMER" | "SUPER_ADMIN" } | null} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        onUserUpdated={() => refetch()} 
      />
    </div>
  );
}
