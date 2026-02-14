"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, type RouterOutputs } from "~/trpc/react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "~/_components/ui/sheet";
import { Button } from "~/_components/ui/button";
import { Input } from "~/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/_components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/_components/ui/form";

type Customer = RouterOutputs["customer"]["getAll"][number];

const editCustomerSchema = z.object({
  companyName: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  tinNumber: z.string().optional(),
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
});

type EditCustomerValues = z.infer<typeof editCustomerSchema>;

interface EditCustomerSheetProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerUpdated?: () => void;
}

export function EditCustomerSheet({
  customer,
  open,
  onOpenChange,
  onCustomerUpdated,
}: EditCustomerSheetProps) {
  const form = useForm<EditCustomerValues>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      tinNumber: "",
      type: "INDIVIDUAL",
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        companyName: customer.companyName,
        contactName: customer.contactName ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        tinNumber: customer.tinNumber ?? "",
        type: customer.type,
      });
    }
  }, [customer, form]);

  const updateCustomer = api.customer.update.useMutation({
    onSuccess: () => {
      toast.success("Customer updated");
      onOpenChange(false);
      onCustomerUpdated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update customer");
    },
  });

  const onSubmit = (values: EditCustomerValues) => {
    if (!customer) return;
    updateCustomer.mutate({
      id: customer.id,
      companyName: values.companyName,
      contactName: values.contactName?.trim() ?? undefined,
      email: values.email?.trim() ?? undefined,
      phone: values.phone?.trim() ?? undefined,
      tinNumber: values.tinNumber?.trim() ?? undefined,
      type: values.type,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Customer</SheetTitle>
          <SheetDescription>
            Update details for {customer?.companyName ?? "this customer"}.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-6"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="COMPANY">Company</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tinNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TIN Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </SheetClose>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || updateCustomer.isPending}
              >
                {form.formState.isSubmitting || updateCustomer.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
