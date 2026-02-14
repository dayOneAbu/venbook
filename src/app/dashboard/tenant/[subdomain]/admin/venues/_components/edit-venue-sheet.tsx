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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/_components/ui/form";

type Venue = RouterOutputs["venue"]["getAll"][number];

const numericField = z
  .string()
  .optional()
  .refine(
    (val) => !val || !Number.isNaN(Number(val)),
    { message: "Must be a number" },
  );

const editVenueSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  basePrice: numericField,
  capacityBanquet: numericField,
  capacityTheater: numericField,
  capacityReception: numericField,
  capacityUshape: numericField,
});

type EditVenueValues = z.infer<typeof editVenueSchema>;

interface EditVenueSheetProps {
  venue: Venue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVenueUpdated?: () => void;
}

export function EditVenueSheet({
  venue,
  open,
  onOpenChange,
  onVenueUpdated,
}: EditVenueSheetProps) {
  const form = useForm<EditVenueValues>({
    resolver: zodResolver(editVenueSchema),
  });

  useEffect(() => {
    if (venue) {
      form.reset({
        id: venue.id,
        name: venue.name,
        description: (venue as Venue & { description?: string | null }).description ?? "",
        basePrice: venue.basePrice ? String(venue.basePrice) : "",
        capacityBanquet: venue.capacityBanquet
          ? String(venue.capacityBanquet)
          : "",
        capacityTheater: venue.capacityTheater
          ? String(venue.capacityTheater)
          : "",
        capacityReception: venue.capacityReception
          ? String(venue.capacityReception)
          : "",
        capacityUshape: venue.capacityUshape
          ? String(venue.capacityUshape)
          : "",
      });
    }
  }, [venue, form]);

  const updateVenue = api.venue.update.useMutation({
    onSuccess: () => {
      toast.success("Venue updated successfully");
      onOpenChange(false);
      onVenueUpdated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update venue");
    },
  });

  const onSubmit = (values: EditVenueValues) => {
    updateVenue.mutate({
      id: values.id,
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Venue</SheetTitle>
          <SheetDescription>
            Update the details and capacities of this event space.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-6"
          >
            <input type="hidden" {...form.register("id")} />

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
                disabled={form.formState.isSubmitting || updateVenue.isPending}
              >
                {form.formState.isSubmitting || updateVenue.isPending
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

