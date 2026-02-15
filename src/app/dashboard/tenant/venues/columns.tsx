"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MapPin, MoreHorizontal, Edit2, Trash2 } from "lucide-react"
import { Button } from "~/_components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/_components/ui/dropdown-menu"
import { Badge } from "~/_components/ui/badge"
import { type RouterOutputs } from "~/trpc/react"

export type Venue = RouterOutputs["venue"]["getAll"][number]

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

interface VenueColumnsProps {
    onEdit: (venue: Venue) => void;
    onDelete: (venue: Venue) => void;
}

export const getColumns = ({ onEdit, onDelete }: VenueColumnsProps): ColumnDef<Venue>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Venue
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue("name")}</span>
        </div>
    ),
  },
  {
    accessorKey: "basePrice",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pricing
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => <div className="font-medium">{formatPrice(row.getValue("basePrice"))}</div>,
  },
  {
    accessorKey: "capacity", // Virtual column for capacity
    header: "Capacity",
    cell: ({ row }) => {
        const venue = row.original;
        const maxCapacity = getMaxCapacity(venue);
        if (maxCapacity) {
             return (
                <span className="text-sm text-muted-foreground">
                    Up to <span className="font-medium text-foreground">{maxCapacity}</span> guests
                </span>
             )
        }
        return <span className="text-sm text-muted-foreground">Not set</span>
    }
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "outline"}>
            {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const venue = row.original
 
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
            <DropdownMenuItem onClick={() => onEdit(venue)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => onDelete(venue)}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete venue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
