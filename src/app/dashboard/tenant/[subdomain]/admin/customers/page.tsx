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
import { AddCustomerSheet } from "./_components/add-customer-sheet";
import { EditCustomerSheet } from "./_components/edit-customer-sheet";
import FadeContent from "~/_components/FadeContent";
import { toast } from "sonner";
import { MoreHorizontal, Edit2, Trash2, Building2, User } from "lucide-react";

type Customer = RouterOutputs["customer"]["getAll"][number];

export default function CustomersPage() {
  const {
    data: customers,
    isLoading,
    error,
    refetch,
  } = api.customer.getAll.useQuery();

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteCustomer = api.customer.delete.useMutation({
    onSuccess: () => {
      toast.success("Customer removed");
      void refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove customer");
    },
  });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    if (
      !confirm(
        `Are you sure you want to delete "${customer.companyName}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    deleteCustomer.mutate({ id: customer.id });
  };

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
            <p className="text-muted-foreground">
              Maintain your database of corporate and individual clients.
            </p>
          </div>
          <AddCustomerSheet onCustomerCreated={() => refetch()} />
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              All customers registered with your hotel. These are linked to bookings and invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading customers...
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message || "Unable to load customers right now."}
              </div>
            ) : !customers || customers.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No customers found. Start by adding your first client.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {customer.type === "COMPANY" ? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{customer.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.contactName ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.type === "COMPANY" ? "default" : "outline"}>
                          {customer.type === "COMPANY" ? "Company" : "Individual"}
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
                            <DropdownMenuItem onClick={() => handleEdit(customer)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleDelete(customer)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete customer
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

      <EditCustomerSheet
        customer={editingCustomer}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onCustomerUpdated={() => refetch()}
      />
    </div>
  );
}
