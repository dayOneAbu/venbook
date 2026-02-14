"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/_components/ui/button";
import { Badge } from "~/_components/ui/badge";
import { Card, CardContent } from "~/_components/ui/card";
import { Skeleton } from "~/_components/ui/skeleton";
import { MapPin, ArrowLeft, Users } from "lucide-react";

function formatPrice(value: unknown) {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export default function VenueDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = api.venue.publicBySlug.useQuery(
    { slug },
    { enabled: Boolean(slug) }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-16 space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-72 w-full rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <p className="text-lg font-semibold">Venue not found</p>
          <p className="text-muted-foreground">
            The venue may be unavailable or removed.
          </p>
          <Button asChild>
            <Link href="/venues">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Venues
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const priceLabel = formatPrice(data.basePrice);
  const capacityLabel =
    data.capacityBanquet ??
    data.capacityReception ??
    data.capacityTheater ??
    data.capacityUshape;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto px-4 py-12 space-y-8">
        <Button variant="ghost" asChild>
          <Link href="/venues">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to venues
          </Link>
        </Button>

        <div className="space-y-4">
          <Badge variant="secondary">{data.hotel.name}</Badge>
          <h1 className="text-4xl font-bold tracking-tight">{data.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {data.hotel.city ?? "Addis Ababa"}, {data.hotel.country ?? "Ethiopia"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2.2fr_1fr]">
          <div className="space-y-6">
            <div className="relative h-80 w-full overflow-hidden rounded-3xl">
              <Image
                src={data.images[0]?.url ?? "/hero.jpeg"}
                alt={data.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {data.images.slice(1, 5).map((image) => (
                <div
                  key={image.url}
                  className="relative h-40 w-full overflow-hidden rounded-2xl"
                >
                  <Image src={image.url} alt={data.name} fill className="object-cover" />
                </div>
              ))}
            </div>

            <Card>
              <CardContent className="space-y-3 p-6">
                <h2 className="text-xl font-semibold">About this venue</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {data.description ??
                    "This venue is designed to deliver a premium event experience."}
                </p>
                {data.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {data.amenities.map((amenity) => (
                      <Badge key={amenity.amenity.name} variant="secondary">
                        {amenity.amenity.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 p-6">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Starting from
                  </div>
                  <div className="text-2xl font-semibold text-primary">
                    {priceLabel ?? "Contact for pricing"}
                  </div>
                </div>
                {capacityLabel && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Up to {capacityLabel} guests</span>
                  </div>
                )}
                <Button className="w-full" asChild>
                  <Link href="/onboard?role=customer">Request Booking</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-6">
                <h3 className="text-lg font-semibold">Hotel Contact</h3>
                <p className="text-sm text-muted-foreground">
                  {data.hotel.address ?? "Contact the hotel for exact directions."}
                </p>
                <div className="text-sm text-muted-foreground">
                  {data.hotel.phone ?? "Phone available after inquiry"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {data.hotel.email ?? "Email available after inquiry"}
                </div>
                {data.hotel.website && (
                  <Link
                    href={data.hotel.website}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Visit website
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
