"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/_components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/_components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/_components/ui/dropdown-menu";
import { Input } from "~/_components/ui/input";
import { Badge } from "~/_components/ui/badge";
import FadeContent from "~/_components/FadeContent";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Edit2, Trash2, Package } from "lucide-react";

export default function ResourcesPage() {
  const { data: resources, isLoading, error, refetch } = api.resource.getAll.useQuery();

  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingQty, setEditingQty] = useState("");

  const createResource = api.resource.create.useMutation({
    onSuccess: () => {
      toast.success("Resource added");
      setNewName("");
      setNewQty("1");
      void refetch();
    },
    onError: (err) => toast.error(err.message ?? "Failed to add resource"),
  });

  const updateResource = api.resource.update.useMutation({
    onSuccess: () => {
      toast.success("Resource updated");
      setEditingId(null);
      void refetch();
    },
    onError: (err) => toast.error(err.message ?? "Failed to update resource"),
  });

  const deleteResource = api.resource.delete.useMutation({
    onSuccess: () => {
      toast.success("Resource removed");
      void refetch();
    },
    onError: (err) => toast.error(err.message ?? "Failed to remove resource"),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    createResource.mutate({ name: trimmed, quantity: Number(newQty) || 1 });
  };

  const handleUpdate = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    updateResource.mutate({ id, name: trimmed, quantity: Number(editingQty) || 1 });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete resource "${name}"? It will be unlinked from all bookings.`)) return;
    deleteResource.mutate({ id });
  };

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resource Management</h2>
          <p className="text-muted-foreground">
            Track equipment, furniture, and other inventory items that can be assigned to bookings.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Add Resource</CardTitle>
            <CardDescription>
              Register a new asset in your hotel&apos;s inventory (e.g. Projectors, Round Tables, PA Systems).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex gap-3 items-end">
              <div className="flex-1 max-w-sm">
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <Input
                  placeholder="e.g. Projector"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="w-24">
                <label className="text-sm font-medium mb-1.5 block">Qty</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  min={1}
                />
              </div>
              <Button type="submit" disabled={createResource.isPending || !newName.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                {createResource.isPending ? "Adding..." : "Add"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </FadeContent>

      <FadeContent delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>
              {resources?.length ?? 0} resources tracked.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading resources...
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message ?? "Unable to load resources."}
              </div>
            ) : !resources || resources.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No resources yet. Add your first one above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-center">Bookings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {editingId === r.id ? (
                          <form
                            onSubmit={(e) => { e.preventDefault(); handleUpdate(r.id); }}
                            className="flex gap-2 items-center"
                          >
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="max-w-xs"
                              autoFocus
                            />
                            <Input
                              type="number"
                              value={editingQty}
                              onChange={(e) => setEditingQty(e.target.value)}
                              className="w-20"
                              min={0}
                            />
                            <Button type="submit" size="sm" disabled={updateResource.isPending}>
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{r.name}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{r.quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {r._count.bookings}
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
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingId(r.id);
                                setEditingName(r.name);
                                setEditingQty(String(r.quantity));
                              }}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleDelete(r.id, r.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}
