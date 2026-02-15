"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { UserRoundPlus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/_components/ui/form";

const customerFormSchema = z.object({
  companyName: z.string().min(1, "Name is required"),
  contactName: z.string().default(""),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().default(""),
  tinNumber: z.string().default(""),
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export function AddCustomerSheet({ onCustomerCreated }: { onCustomerCreated?: () => void }) {
  const [open, setOpen] = useState(false);

  const form = useForm<CustomerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(customerFormSchema) as any,
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      tinNumber: "",
      type: "INDIVIDUAL",
    },
  });

  const createCustomer = api.customer.create.useMutation({
    onSuccess: () => {
      toast.success("Customer added successfully");
      form.reset();
      setOpen(false);
      onCustomerCreated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add customer");
    },
  });

  const onSubmit = (values: CustomerFormValues) => {
    createCustomer.mutate({
      companyName: values.companyName,
      contactName: values.contactName?.trim() ?? undefined,
      email: values.email?.trim() ?? undefined,
      phone: values.phone?.trim() ?? undefined,
      tinNumber: values.tinNumber?.trim() ?? undefined,
      type: values.type,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <UserRoundPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Customer</SheetTitle>
          <SheetDescription>
            Register a new corporate or individual client for your hotel.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-6"
          >
            <FormField<CustomerFormValues, "type">
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <FormField<CustomerFormValues, "companyName">
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe or Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField<CustomerFormValues, "contactName">
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Primary contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField<CustomerFormValues, "email">
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="client@example.com" {...field} />
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
                      <Input placeholder="+251 9..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField<CustomerFormValues, "tinNumber">
              control={form.control}
              name="tinNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TIN Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Tax identification number" {...field} />
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
                disabled={form.formState.isSubmitting || createCustomer.isPending}
              >
                {form.formState.isSubmitting || createCustomer.isPending
                  ? "Adding..."
                  : "Add Customer"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
