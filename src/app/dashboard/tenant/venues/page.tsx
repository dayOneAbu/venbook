"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/_components/ui/card";
import { AddVenueSheet } from "./_components/add-venue-sheet";
import { EditVenueSheet } from "./_components/edit-venue-sheet";
import FadeContent from "~/_components/FadeContent";
import { toast } from "sonner";
import { DataTable } from "~/_components/ui/data-table";
import { getColumns, type Venue } from "./columns";

export default function VenuesPage() {
  const {
    data: venues,
    isLoading,
    error,
    refetch,
  } = api.venue.getAll.useQuery();

  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const deleteVenue = api.venue.delete.useMutation({
    onSuccess: () => {
      toast.success("Venue deleted");
      void refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete venue");
    },
  });

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
  };

  const handleDelete = (venue: Venue) => {
    if (
      !confirm(
        `Are you sure you want to delete "${venue.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    deleteVenue.mutate({ id: venue.id });
  };

  const columns = getColumns({
      onEdit: handleEdit,
      onDelete: handleDelete
  });

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Venue Management</h2>
            <p className="text-muted-foreground">
              Configure the function rooms and event spaces for your hotel.
            </p>
          </div>
          <AddVenueSheet onVenueCreated={() => refetch()} />
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
            <CardDescription>
              All venues attached to your hotel. These control what appears on the
              public marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading venues...
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message || "Unable to load venues right now."}
              </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={venues ?? []} 
                    filterColumnName="name"
                    filterPlaceholder="Filter venues..."
                />
            )}
          </CardContent>
        </Card>
      </FadeContent>

      <EditVenueSheet
        venue={editingVenue}
        open={!!editingVenue}
        onOpenChange={(open) => !open && setEditingVenue(null)}
        onVenueUpdated={() => {
            void refetch();
            setEditingVenue(null);
        }}
      />
    </div>
  );
}

