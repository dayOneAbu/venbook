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
import { MapPinPlus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/_components/ui/form";

const numericField = z
  .string()
  .optional()
  .refine(
    (val) => !val || !Number.isNaN(Number(val)),
    { message: "Must be a number" },
  );

const venueFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  basePrice: numericField,
  capacityBanquet: numericField,
  capacityTheater: numericField,
  capacityReception: numericField,
  capacityUshape: numericField,
});

type VenueFormValues = z.infer<typeof venueFormSchema>;

export function AddVenueSheet({ onVenueCreated }: { onVenueCreated?: () => void }) {
  const [open, setOpen] = useState(false);

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: "",
      capacityBanquet: "",
      capacityTheater: "",
      capacityReception: "",
      capacityUshape: "",
    },
  });

  const createVenue = api.venue.create.useMutation({
    onSuccess: () => {
      toast.success("Venue created successfully");
      form.reset();
      setOpen(false);
      onVenueCreated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create venue");
    },
  });

  const onSubmit = (values: VenueFormValues) => {
    createVenue.mutate({
      name: values.name,
      description: values.description?.trim() ?? undefined,
      basePrice: values.basePrice ? Number(values.basePrice) : undefined,
      capacityBanquet: values.capacityBanquet
        ? Number(values.capacityBanquet)
        : undefined,
      capacityTheater: values.capacityTheater
        ? Number(values.capacityTheater)
        : undefined,
      capacityReception: values.capacityReception
        ? Number(values.capacityReception)
        : undefined,
      capacityUshape: values.capacityUshape
        ? Number(values.capacityUshape)
        : undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <MapPinPlus className="mr-2 h-4 w-4" />
          Add Venue
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Venue</SheetTitle>
          <SheetDescription>
            Create a new function room or event space for your hotel.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Grand Ballroom" {...field} />
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
                    <Input
                      placeholder="Short description for internal and public views"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price (ETB)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="15000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacityBanquet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banquet Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="250"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacityTheater"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theater Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="350"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacityReception"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reception Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacityUshape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>U-Shape Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="80"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </SheetClose>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || createVenue.isPending}
              >
                {form.formState.isSubmitting || createVenue.isPending
                  ? "Creating..."
                  : "Create Venue"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

