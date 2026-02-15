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
import FadeContent from "~/_components/FadeContent";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Edit2, Trash2, Sparkles } from "lucide-react";

export default function AmenitiesPage() {
  const { data: amenities, isLoading, error, refetch } = api.amenity.getAll.useQuery();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const createAmenity = api.amenity.create.useMutation({
    onSuccess: () => {
      toast.success("Amenity added");
      setNewName("");
      void refetch();
    },
    onError: (err) => toast.error(err.message ?? "Failed to add amenity"),
  });

  const updateAmenity = api.amenity.update.useMutation({
    onSuccess: () => {
      toast.success("Amenity updated");
      setEditingId(null);
      void refetch();
    },
    onError: (err) => toast.error(err.message ?? "Failed to update amenity"),
  });

  const deleteAmenity = api.amenity.delete.useMutation({
    onSuccess: () => {
      toast.success("Amenity removed");
      void refetch();
    },
    onError: (err) => toast.error(err.message ?? "Failed to remove amenity"),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    createAmenity.mutate({ name: trimmed });
  };

  const handleUpdate = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    updateAmenity.mutate({ id, name: trimmed });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete amenity "${name}"? It will be unlinked from all venues.`)) return;
    deleteAmenity.mutate({ id });
  };

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Amenities &amp; Services</h2>
          <p className="text-muted-foreground">
            Manage the amenity catalog. Amenities can be tagged to venues for guest visibility.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Add Amenity</CardTitle>
            <CardDescription>
              Create a new amenity that can be assigned to any venue (e.g. WiFi, Projector, Sound System).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex gap-3">
              <Input
                placeholder="e.g. High-Speed WiFi"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" disabled={createAmenity.isPending || !newName.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                {createAmenity.isPending ? "Adding..." : "Add"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </FadeContent>

      <FadeContent delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>All Amenities</CardTitle>
            <CardDescription>
              {amenities?.length ?? 0} amenities in the catalog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading amenities...
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message ?? "Unable to load amenities."}
              </div>
            ) : !amenities || amenities.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No amenities yet. Add your first one above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amenities.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        {editingId === a.id ? (
                          <form
                            onSubmit={(e) => { e.preventDefault(); handleUpdate(a.id); }}
                            className="flex gap-2"
                          >
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="max-w-xs"
                              autoFocus
                            />
                            <Button type="submit" size="sm" disabled={updateAmenity.isPending}>
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
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{a.name}</span>
                          </div>
                        )}
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
                                setEditingId(a.id);
                                setEditingName(a.name);
                              }}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleDelete(a.id, a.name)}
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
