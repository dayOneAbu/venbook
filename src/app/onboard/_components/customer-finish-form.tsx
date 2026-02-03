"use client";

import { useState } from "react";
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
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

const finishSchema = z.object({
  image: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type FinishValues = z.infer<typeof finishSchema>;

export function CustomerFinishForm() {
  const { customerData, updateCustomerData, prevStep, reset } =
    useCustomerOnboardingStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateProfile = api.user.updateProfile.useMutation();
  const updateOnboardingStatus = api.user.updateOnboardingStatus.useMutation();

  const form = useForm<FinishValues>({
    resolver: zodResolver(finishSchema),
    defaultValues: {
      image: customerData.image,
    },
  });

  const isSaving =
    (updateProfile.isPending ?? false) ||
    (updateOnboardingStatus.isPending ?? false);

  async function handleFinish(values: FinishValues) {
    const imageValue = values.image?.trim();
    updateCustomerData({ image: imageValue ?? "" });
    setSubmitError(null);

    try {
      await updateProfile.mutateAsync({
        name: customerData.name,
        phone: customerData.phone,
        image: imageValue ?? undefined,
      });
      await updateOnboardingStatus.mutateAsync({ isOnboarded: true });

      toast.success("Profile complete. Welcome to VenBook!");
      reset();
      const nextPath = searchParams.get("next") ?? "/venues";
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to complete onboarding";
      setSubmitError(message);
      toast.error(message);
    }
  }

  function handleSaveDraft() {
    updateCustomerData({ image: form.getValues("image") ?? "" });
    toast.success("Draft saved.");
  }

  return (
    <div className="space-y-6">
      {submitError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Confirm Details</h2>
        <p className="text-muted-foreground text-sm">
          Review your details and add a profile photo if you want.
        </p>
      </div>

      <div className="bg-muted/40 rounded-lg p-6 space-y-6 border border-border">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Contact
          </h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-semibold text-right">{customerData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold text-right">
                {customerData.email ?? session?.user?.email ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-semibold text-right">{customerData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">City</span>
              <span className="font-semibold text-right">
                {customerData.city ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Country</span>
              <span className="font-semibold text-right">
                {customerData.country ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Booking Type
          </h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-semibold text-right">
                {customerData.type === "COMPANY" ? "Company" : "Individual"}
              </span>
            </div>
            {customerData.type === "COMPANY" && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organization</span>
                  <span className="font-semibold text-right">
                    {customerData.companyName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Person</span>
                  <span className="font-semibold text-right">
                    {customerData.contactName ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TIN Number</span>
                  <span className="font-semibold text-right">
                    {customerData.tinNumber ?? "—"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFinish)} className="space-y-4">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Photo URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="button" variant="secondary" onClick={handleSaveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button
                type="submit"
                size="lg"
                className="px-8 bg-green-600 hover:bg-green-700"
                disabled={isSaving}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isSaving ? "Finishing..." : "Complete Profile"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
