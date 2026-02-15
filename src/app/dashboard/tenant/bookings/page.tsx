"use client";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/_components/ui/card";
import { AddBookingSheet } from "./_components/add-booking-sheet";
import FadeContent from "~/_components/FadeContent";
import { toast } from "sonner";
import { DataTable } from "~/_components/ui/data-table";
import { getColumns, type Booking } from "./columns";

export default function BookingsPage() {
  const {
    data: bookings,
    isLoading,
    error,
    refetch,
  } = api.booking.getAll.useQuery();

  const updateStatus = api.booking.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      void refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const cancelBooking = api.booking.cancel.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelled");
      void refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to cancel booking");
    },
  });

  const deleteBooking = api.booking.delete.useMutation({
    onSuccess: () => {
      toast.success("Booking deleted");
      void refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete booking");
    },
  });

  const handleCancel = (booking: Booking) => {
    if (!confirm(`Cancel booking "${booking.eventName}" (${booking.bookingNumber})?`)) return;
    cancelBooking.mutate({ id: booking.id });
  };

  const handleDelete = (booking: Booking) => {
    if (!confirm(`Permanently delete "${booking.bookingNumber}"? This cannot be undone.`)) return;
    deleteBooking.mutate({ id: booking.id });
  };

  const handleStatusChange = (bookingId: string, status: string) => {
    updateStatus.mutate({
      id: bookingId,
      status: status as Parameters<typeof updateStatus.mutate>[0]["status"],
    });
  };

  const columns = getColumns({
      onStatusChange: handleStatusChange,
      onCancel: handleCancel,
      onDelete: handleDelete
  });

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bookings Management</h2>
            <p className="text-muted-foreground">
              Manage your hotel&apos;s reservations, event schedules, and availability.
            </p>
          </div>
          <AddBookingSheet onBookingCreated={() => refetch()} />
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>
              Events and reservations across all your venues, sorted by date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading bookings...
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message || "Unable to load bookings right now."}
              </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={bookings ?? []} 
                    filterColumnName="eventName"
                    filterPlaceholder="Filter events..."
                />
            )}
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}

