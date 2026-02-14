"use client";

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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "~/_components/ui/dropdown-menu";
import { AddBookingSheet } from "./_components/add-booking-sheet";
import FadeContent from "~/_components/FadeContent";
import { toast } from "sonner";
import { MoreHorizontal, Ban, ArrowRightLeft, Trash2 } from "lucide-react";

type Booking = RouterOutputs["booking"]["getAll"][number];

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  INQUIRY: { label: "Inquiry", variant: "outline" },
  TENTATIVE: { label: "Tentative", variant: "secondary" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  EXECUTED: { label: "Executed", variant: "default" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  CONFLICT: { label: "Conflict", variant: "destructive" },
  WAITLIST: { label: "Waitlist", variant: "outline" },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  INQUIRY: ["TENTATIVE", "CONFIRMED", "CANCELLED"],
  TENTATIVE: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["EXECUTED", "CANCELLED"],
  EXECUTED: ["COMPLETED"],
  CONFLICT: ["TENTATIVE", "CANCELLED"],
  WAITLIST: ["TENTATIVE", "CONFIRMED", "CANCELLED"],
};

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

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
            ) : !bookings || bookings.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No bookings yet. Create your first booking to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking #</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => {
                      const cfg = STATUS_CONFIG[booking.status] ?? { label: booking.status, variant: "outline" as const };
                      const transitions = STATUS_TRANSITIONS[booking.status] ?? [];

                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">
                            {booking.bookingNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{booking.eventName}</span>
                              {booking.eventType && (
                                <span className="text-xs text-muted-foreground">{booking.eventType}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {booking.venue.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {booking.customer.companyName}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {formatDate(booking.eventDate)}
                          </TableCell>
                          <TableCell className="text-center">
                            {booking.guestCount}
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {formatPrice(booking.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={cfg.variant}>
                              {cfg.label}
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

                                {transitions.length > 0 && (
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                                      Change Status
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                      {transitions.map((s) => (
                                        <DropdownMenuItem
                                          key={s}
                                          onClick={() => handleStatusChange(booking.id, s)}
                                        >
                                          {STATUS_CONFIG[s]?.label ?? s}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                )}

                                {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                      onClick={() => handleCancel(booking)}
                                    >
                                      <Ban className="mr-2 h-4 w-4" />
                                      Cancel Booking
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {booking.status === "CANCELLED" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                      onClick={() => handleDelete(booking)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Permanently
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}
