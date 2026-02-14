"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/_components/ui/card";
import { Button } from "~/_components/ui/button";
import { Input } from "~/_components/ui/input";
import { Checkbox } from "~/_components/ui/checkbox";
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
  FormDescription,
} from "~/_components/ui/form";
import FadeContent from "~/_components/FadeContent";
import { Separator } from "~/_components/ui/separator";

// --- Hotel Profile Form ---
const profileSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  address: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

function HotelProfileForm() {
  const { data: profile, isLoading } = api.hotel.getProfile.useQuery();
  const utils = api.useUtils();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      email: "",
      phone: "",
      website: "",
      city: "",
      state: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? "",
        address: profile.address ?? "",
        description: profile.description ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        website: profile.website ?? "",
        city: profile.city ?? "",
        state: profile.state ?? "",
      });
    }
  }, [profile, form]);

  const updateProfile = api.hotel.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated");
      void utils.hotel.getProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const onSubmit = (values: ProfileValues) => {
    updateProfile.mutate({
      name: values.name,
      address: values.address?.trim() ?? undefined,
      description: values.description?.trim() ?? undefined,
      email: values.email?.trim() ?? undefined,
      phone: values.phone?.trim() ?? undefined,
      website: values.website?.trim() ?? undefined,
      city: values.city?.trim() ?? undefined,
      state: values.state?.trim() ?? undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading profile...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Profile</CardTitle>
        <CardDescription>
          Update your hotel&apos;s public information. This appears on the marketplace listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="A brief description of your property" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
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
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Region</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourhotel.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// --- Operational Settings Form ---
const settingsSchema = z.object({
  taxStrategy: z.enum(["STANDARD", "COMPOUND"]),
  vatRate: z.string(),
  serviceChargeRate: z.string(),
  currency: z.string().min(1),
  allowCapacityOverride: z.boolean(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

function OperationalSettingsForm() {
  const { data: settings, isLoading } = api.hotel.getSettings.useQuery();
  const utils = api.useUtils();

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      taxStrategy: "STANDARD",
      vatRate: "15",
      serviceChargeRate: "10",
      currency: "ETB",
      allowCapacityOverride: false,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        taxStrategy: settings.taxStrategy,
        vatRate: String(settings.vatRate),
        serviceChargeRate: String(settings.serviceChargeRate),
        currency: settings.currency,
        allowCapacityOverride: settings.allowCapacityOverride,
      });
    }
  }, [settings, form]);

  const updateSettings = api.hotel.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated");
      void utils.hotel.getSettings.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  const onSubmit = (values: SettingsValues) => {
    updateSettings.mutate({
      taxStrategy: values.taxStrategy,
      vatRate: Number(values.vatRate),
      serviceChargeRate: Number(values.serviceChargeRate),
      currency: values.currency,
      allowCapacityOverride: values.allowCapacityOverride,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading settings...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Settings</CardTitle>
        <CardDescription>
          Configure pricing rules, tax compliance, and booking policies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="taxStrategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Strategy</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard — VAT on Subtotal</SelectItem>
                      <SelectItem value="COMPOUND">Compound — VAT on (Subtotal + Service Charge)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Controls how VAT is calculated relative to the service charge.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vatRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceChargeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Charge (%)</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ETB">ETB — Ethiopian Birr</SelectItem>
                      <SelectItem value="USD">USD — US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowCapacityOverride"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Allow Capacity Override</FormLabel>
                    <FormDescription>
                      When enabled, bookings can exceed venue capacity limits.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {settings?.tinNumber && (
              <div className="rounded-md border p-4 text-sm">
                <span className="font-medium">TIN Number:</span>{" "}
                <span className="text-muted-foreground">{settings.tinNumber}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// --- Main Page ---
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hotel Settings</h2>
          <p className="text-muted-foreground">
            Manage your hotel&apos;s profile, pricing rules, and operational policies.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <HotelProfileForm />
      </FadeContent>

      <Separator />

      <FadeContent delay={0.4}>
        <OperationalSettingsForm />
      </FadeContent>
    </div>
  );
}
