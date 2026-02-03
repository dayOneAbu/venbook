"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCustomerOnboardingStore } from "~/lib/store/customer-onboarding-store";
import { Button } from "~/_components/ui/button";
import { Input } from "~/_components/ui/input";
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
import { ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "~/server/better-auth/client";

const customerProfileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().min(9, "Phone number is required"),
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
});

type CustomerProfileValues = z.infer<typeof customerProfileSchema>;

export function CustomerProfileForm() {
  const { customerData, updateCustomerData, nextStep } =
    useCustomerOnboardingStore();
  const { data: session } = authClient.useSession();

  const form = useForm<CustomerProfileValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      type: customerData.type,
    },
  });

  useEffect(() => {
    if (!session?.user) return;
    if (
      customerData.name !== "" ||
      customerData.email !== "" ||
      customerData.phone !== ""
    ) {
      return;
    }
    const nextDefaults = {
      name: session.user.name ?? "",
      email: session.user.email ?? "",
      phone: session.user.phone ?? "",
    };
    updateCustomerData(nextDefaults);
    form.reset(nextDefaults);
  }, [session, customerData.name, customerData.email, customerData.phone, updateCustomerData, form]);

  function onSubmit(values: CustomerProfileValues) {
    updateCustomerData({
      name: customerData.name ?? session?.user?.name ?? "",
      email: values.email ?? customerData.email ?? "",
      phone: values.phone,
      type: values.type,
    });
    nextStep();
  }

  function handleSaveDraft() {
    updateCustomerData(form.getValues());
    toast.success("Draft saved.");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          About You
        </h2>
        <p className="text-muted-foreground text-sm">
          This helps venues confirm your inquiry quickly.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Selam Tesfaye"
                      {...field}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Your name is set from signup and can&apos;t be changed here.
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="selam@email.com"
                      {...field}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    This comes from your login and can be updated later.
                  </p>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+251-91-..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
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
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
