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
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "~/_components/ui/sheet";
import { Button } from "~/_components/ui/button";
import { Input } from "~/_components/ui/input";
import { UserPlus, Copy, Check } from "lucide-react";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/_components/ui/dialog";

const inviteStaffSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["HOTEL_ADMIN", "SALES", "OPERATIONS", "FINANCE"]),
});

type InviteStaffInput = z.infer<typeof inviteStaffSchema>;

export function AddStaffSheet({ onUserAdded }: { onUserAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteStaffInput>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      email: "",
      role: "SALES",
    },
  });

  const createInvite = api.invite.create.useMutation({
    onSuccess: (data) => {
      toast.success("Invite created successfully");
      const link = `${window.location.origin}/auth/invite?token=${data.token}`;
      setInviteLink(link);
      form.reset();
      onUserAdded?.();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create invite");
    },
  });

  const onSubmit = (data: InviteStaffInput) => {
    createInvite.mutate(data);
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      void navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Staff
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Invite New Staff</SheetTitle>
            <SheetDescription>
              Create an invite link for a new team member. They will set their own password.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  {form.formState.isSubmitting ? "Creating..." : "Create Invite"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <Dialog open={!!inviteLink} onOpenChange={(open) => !open && setInviteLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Link Created</DialogTitle>
            <DialogDescription>
              Share this link with your staff member to let them join the team.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input value={inviteLink ?? ""} readOnly />
            <Button size="icon" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => {
              setInviteLink(null);
              setOpen(false);
            }}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
