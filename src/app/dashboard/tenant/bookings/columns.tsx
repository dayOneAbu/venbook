"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ArrowRightLeft, Ban, Trash2 } from "lucide-react"
import { Button } from "~/_components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "~/_components/ui/dropdown-menu"
import { Badge } from "~/_components/ui/badge"
import { type RouterOutputs } from "~/trpc/react"

// Define the shape of our data.
// We can assume this comes from our TRPC router output
export type Booking = RouterOutputs["booking"]["getAll"][number]

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
  TENTATIVE: ["DRAFT", "CONFIRMED", "CANCELLED"], // Added DRAFT just in case, though not in config
  CONFIRMED: ["EXECUTED", "CANCELLED"],
  EXECUTED: ["COMPLETED"],
  CONFLICT: ["TENTATIVE", "CANCELLED"],
  WAITLIST: ["TENTATIVE", "CONFIRMED", "CANCELLED"],
};

interface BookingColumnsProps {
    onStatusChange: (id: string, status: string) => void;
    onCancel: (booking: Booking) => void;
    onDelete: (booking: Booking) => void;
}

export const getColumns = ({ onStatusChange, onCancel, onDelete }: BookingColumnsProps): ColumnDef<Booking>[] => [
  {
    accessorKey: "bookingNumber",
    header: "Booking #",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("bookingNumber")}</div>,
  },
  {
    accessorKey: "eventName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const eventName = row.original.eventName;
        const eventType = row.original.eventType;
        return (
            <div className="flex flex-col">
                <span className="font-medium">{eventName}</span>
                {eventType && <span className="text-xs text-muted-foreground">{eventType}</span>}
            </div>
        )
    }
  },
  {
    accessorKey: "venue.name", // Access nested data
    header: "Venue",
    cell: ({ row }) => <div className="text-muted-foreground">{row.original.venue.name}</div>,
  },
  {
    accessorKey: "customer.companyName",
    header: "Customer",
    cell: ({ row }) => <div className="text-muted-foreground">{row.original.customer.companyName || row.original.customer.contactName}</div>,
  },
  {
    accessorKey: "eventDate",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
      const date = new Date(row.getValue("eventDate"))
      const formatted = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date)
 
      return <div className="text-muted-foreground whitespace-nowrap">{formatted}</div>
    },
  },
  {
    accessorKey: "guestCount",
    header: "Guests",
    cell: ({ row }) => <div className="text-center">{row.getValue("guestCount")}</div>,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount") || "0")
      const formatted = new Intl.NumberFormat("en-ET", {
        style: "currency",
        currency: "ETB",
        maximumFractionDigits: 0,
      }).format(amount)
 
      return <div className="font-medium whitespace-nowrap">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const cfg = STATUS_CONFIG[status as string] ?? { label: status as string, variant: "outline" };

      return (
        <Badge variant={cfg.variant}>
            {cfg.label}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const booking = row.original
      const transitions = STATUS_TRANSITIONS[booking.status] ?? [];
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {/* 
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(booking.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            */}
            <DropdownMenuSeparator />
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
                        onClick={() => onStatusChange(booking.id, s)}
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
                    onClick={() => onCancel(booking)}
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
                    onClick={() => onDelete(booking)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Permanently
                </DropdownMenuItem>
                </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
