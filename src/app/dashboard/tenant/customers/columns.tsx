"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Mail, Phone } from "lucide-react"
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

// Define the shape of our data.
export type Customer = RouterOutputs["customer"]["getAll"][number]

interface CustomerColumnsProps {
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
}

export const getColumns = ({ onEdit, onDelete }: CustomerColumnsProps): ColumnDef<Customer>[] => [
  {
    accessorKey: "companyName",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company / Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => (
        <div className="font-medium">
            {row.getValue("companyName")}
            {row.original.contactName && row.original.contactName !== row.original.companyName && (
                <div className="text-xs text-muted-foreground">{row.original.contactName}</div>
            )}
        </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Contact Info",
    cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-sm">
            {row.original.email && (
                <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span>{row.original.email}</span>
                </div>
            )}
            {row.original.phone && (
                <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{row.original.phone}</span>
                </div>
            )}
        </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
        <Badge variant="outline">{row.original.type}</Badge>
    ),
  },
  {
    accessorKey: "tinNumber",
    header: "TIN",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("tinNumber") ?? "—"}</div>,
  },
  {
    accessorKey: "bookingCount", // Assuming we might add this later or pass it in
    header: "Bookings",
    cell: ({ row }) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const count = (row.original as any)._count?.bookings ?? 0;
        return <div className="text-center">{count}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original
 
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
            <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => onDelete(customer)}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
