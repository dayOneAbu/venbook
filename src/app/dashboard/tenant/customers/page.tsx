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
import { AddCustomerSheet } from "./_components/add-customer-sheet";
import { EditCustomerSheet } from "./_components/edit-customer-sheet";
import FadeContent from "~/_components/FadeContent";
import { toast } from "sonner";
import { DataTable } from "~/_components/ui/data-table";
import { getColumns, type Customer } from "./columns";

export default function CustomersPage() {
  const {
    data: customers,
    isLoading,
    error,
    refetch,
  } = api.customer.getAll.useQuery();

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const deleteCustomer = api.customer.delete.useMutation({
    onSuccess: () => {
      toast.success("Customer deleted");
      void refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete customer");
    },
  });

  const handleDelete = (customer: Customer) => {
    if (!confirm(`Permanently delete "${customer.companyName}"? This cannot be undone.`)) return;
    deleteCustomer.mutate({ id: customer.id });
  };

  const handleEdit = (customer: Customer) => {
      setEditingCustomer(customer);
  }

  const columns = getColumns({
      onEdit: handleEdit,
      onDelete: handleDelete
  });

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">
              Manage your client base, including individuals and corporate accounts.
            </p>
          </div>
          <AddCustomerSheet onCustomerCreated={() => refetch()} />
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
            <CardDescription>
              A list of all customers who have inquired or booked with your venues.
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
            ) : (
                <DataTable
                    columns={columns}
                    data={customers ?? []}
                    filterColumnName="companyName"
                    filterPlaceholder="Filter customers..."
                />
            )}
          </CardContent>
        </Card>
      </FadeContent>

      <EditCustomerSheet
        customer={editingCustomer}
        open={!!editingCustomer}
        onOpenChange={(open) => !open && setEditingCustomer(null)}
        onCustomerUpdated={() => {
            void refetch();
            setEditingCustomer(null);
        }}
      />
    </div>
  );
}
