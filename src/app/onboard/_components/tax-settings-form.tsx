"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboardingStore } from "~/lib/store/onboarding-store";
import { Button } from "~/_components/ui/button";
import { Input } from "~/_components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/_components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/_components/ui/select";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

const taxSettingsSchema = z.object({
  taxStrategy: z.enum(["STANDARD", "COMPOUND"]),
  vatRate: z.coerce.number().min(0).max(100),
  serviceChargeRate: z.coerce.number().min(0).max(100),
});

type TaxSettingsValues = z.infer<typeof taxSettingsSchema>;

export function TaxSettingsForm() {
  const { hotelData, updateHotelData, nextStep, prevStep } = useOnboardingStore();

  const form = useForm<TaxSettingsValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(taxSettingsSchema) as any,
    defaultValues: {
      taxStrategy: hotelData.taxStrategy,
      vatRate: hotelData.vatRate,
      serviceChargeRate: hotelData.serviceChargeRate,
    },
  });

  function onSubmit(values: TaxSettingsValues) {
    updateHotelData(values);
    nextStep();
  }

  function handleSaveDraft() {
    updateHotelData(form.getValues());
    toast.success("Draft saved.");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Tax & Billing</h2>
        <p className="text-muted-foreground text-sm">
          Set up your default rates for Ethiopian tax compliance.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField<TaxSettingsValues, "taxStrategy">
            control={form.control}
            name="taxStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Strategy</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard (VAT on subtotal)</SelectItem>
                    <SelectItem value="COMPOUND">Compound (VAT on subtotal + service charge)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose how VAT is calculated in relation to service charges.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-6">
            <FormField<TaxSettingsValues, "vatRate">
              control={form.control}
              name="vatRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<TaxSettingsValues, "serviceChargeRate">
              control={form.control}
              name="serviceChargeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Charge (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
