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
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

const organizationSchema = z
  .object({
    type: z.enum(["INDIVIDUAL", "COMPANY"]),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    companyName: z.string().optional(),
    contactName: z.string().optional(),
    tinNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "COMPANY" && !data.companyName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Company name is required",
      });
    }
  });

type OrganizationValues = z.infer<typeof organizationSchema>;

export function CustomerOrganizationForm() {
  const { customerData, updateCustomerData, nextStep, prevStep } =
    useCustomerOnboardingStore();

  const form = useForm<OrganizationValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      type: customerData.type,
      city: customerData.city,
      country: customerData.country,
      companyName: customerData.companyName,
      contactName: customerData.contactName,
      tinNumber: customerData.tinNumber,
    },
  });

  const isCompany = customerData.type === "COMPANY";

  useEffect(() => {
    form.setValue("type", customerData.type);
  }, [customerData.type, form]);

  function onSubmit(values: OrganizationValues) {
    updateCustomerData({
      city: values.city,
      country: values.country,
      companyName: values.companyName ?? "",
      contactName: values.contactName ?? "",
      tinNumber: values.tinNumber ?? "",
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
          Organization Details
        </h2>
        <p className="text-muted-foreground text-sm">
          Help venues understand who is booking the event.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("type")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Addis Ababa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Ethiopia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isCompany && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization / Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Selam Events PLC" {...field} />
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
                      <FormLabel>Contact Person (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Main point of contact" {...field} />
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
                    <FormLabel>TIN Number (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="0012345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between sm:items-center">
            <Button type="button" variant="ghost" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="button" variant="secondary" onClick={handleSaveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button type="submit" size="lg">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
