"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit2, Trash2 } from "lucide-react"
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

export type User = RouterOutputs["user"]["getAll"][number]

function getRoleBadgeVariant(role: string) {
    switch (role) {
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
}

interface StaffColumnsProps {
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export const getColumns = ({ onEdit, onDelete }: StaffColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => (
        <div className="flex flex-col font-medium">
            <span>{row.getValue("name")}</span>
            {row.original.isOnboarded && (
                <span className="text-xs text-muted-foreground italic">Onboarded</span>
            )}
        </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
        const role = row.getValue("role");
        return (
            <Badge variant={getRoleBadgeVariant(role as string)}>
                {(role as string).replace("_", " ")}
            </Badge>
        )
    },
  },
  {
    accessorKey: "emailVerified", // Virtual column for status
    header: "Status",
    cell: ({ row }) => {
        const isVerified = row.original.emailVerified;
        return (
            <Badge variant={isVerified ? "outline" : "secondary"} className={isVerified ? "bg-green-50 text-green-700 border-green-200" : ""}>
                {isVerified ? "Verified" : "Pending"}
            </Badge>
        )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
 
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
            <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => onDelete(user)}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Staff
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
