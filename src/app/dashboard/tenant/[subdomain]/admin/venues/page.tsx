"use client";

import { useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";
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
import { Badge } from "~/_components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/_components/ui/dropdown-menu";
import { AddVenueSheet } from "./_components/add-venue-sheet";
import { EditVenueSheet } from "./_components/edit-venue-sheet";
import FadeContent from "~/_components/FadeContent";
import { toast } from "sonner";
import { MapPin, MoreHorizontal, Edit2, Trash2 } from "lucide-react";

type Venue = RouterOutputs["venue"]["getAll"][number];

function formatPrice(value: unknown) {
  if (value === null || value === undefined) return "—";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "—";
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function getMaxCapacity(venue: Venue) {
  const values = [
    venue.capacityBanquet,
    venue.capacityReception,
    venue.capacityTheater,
    venue.capacityUshape,
  ]
    .filter((v) => v !== null && v !== undefined)
    .map((v) => Number(v));

  if (values.length === 0) return null;
  return Math.max(...values);
}

export default function VenuesPage() {
  const {
    data: venues,
    isLoading,
    error,
    refetch,
  } = api.venue.getAll.useQuery();

  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
    setIsEditOpen(true);
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
            ) : !venues || venues.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No venues found. Start by adding your first event space.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venue</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venues.map((venue) => {
                    const maxCapacity = getMaxCapacity(venue);

                    return (
                      <TableRow key={venue.id}>
                        <TableCell className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{venue.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatPrice(venue.basePrice)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {maxCapacity ? (
                            <span className="text-sm text-muted-foreground">
                              Up to{" "}
                              <span className="font-medium text-foreground">
                                {maxCapacity}
                              </span>{" "}
                              guests
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Not set
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={venue.isActive ? "default" : "outline"}>
                            {venue.isActive ? "Active" : "Inactive"}
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
                              <DropdownMenuItem onClick={() => handleEdit(venue)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => handleDelete(venue)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete venue
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </FadeContent>

      <EditVenueSheet
        venue={editingVenue}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onVenueUpdated={() => refetch()}
      />
    </div>
  );
}

