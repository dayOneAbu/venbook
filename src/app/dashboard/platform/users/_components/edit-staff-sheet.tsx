"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "~/_components/ui/sheet";
import { Button } from "~/_components/ui/button";
import { Input } from "~/_components/ui/input";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/_components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/_components/ui/select";

const editStaffSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["HOTEL_ADMIN", "SALES", "OPERATIONS", "FINANCE"]),
});

type EditStaffInput = z.infer<typeof editStaffSchema>;

interface EditStaffSheetProps {
  user: {
    id: string;
    name: string | null;
    role: "HOTEL_ADMIN" | "SALES" | "OPERATIONS" | "FINANCE" | "CUSTOMER" | "SUPER_ADMIN";
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => void;
}

export function EditStaffSheet({ user, open, onOpenChange, onUserUpdated }: EditStaffSheetProps) {
  const form = useForm<EditStaffInput>({
    resolver: zodResolver(editStaffSchema),
  });

  useEffect(() => {
    if (user) {
      form.reset({
        id: user.id,
        name: user.name ?? "",
        role: ["HOTEL_ADMIN", "SALES", "OPERATIONS", "FINANCE"].includes(user.role) 
            ? user.role as EditStaffInput["role"]
            : "SALES",
      });
    }
  }, [user, form]);

  const updateStaff = api.user.update.useMutation({
    onSuccess: () => {
      toast.success("Staff member updated successfully");
      onOpenChange(false);
      onUserUpdated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update staff member");
    },
  });

  const onSubmit = (data: EditStaffInput) => {
    updateStaff.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Staff Member</SheetTitle>
          <SheetDescription>
            Update the role or name of this team member.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <input type="hidden" {...form.register("id")} />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="HOTEL_ADMIN">Hotel Admin</SelectItem>
                      <SelectItem value="SALES">Sales</SelectItem>
                      <SelectItem value="OPERATIONS">Operations</SelectItem>
                      <SelectItem value="FINANCE">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
