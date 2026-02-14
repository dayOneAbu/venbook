"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Input } from "~/_components/ui/input";
import { Button } from "~/_components/ui/button";
import { Badge } from "~/_components/ui/badge";
import { Card, CardContent } from "~/_components/ui/card";
import { Skeleton } from "~/_components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/_components/ui/select";
import { MapPin, Search, ArrowRight } from "lucide-react";

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

export default function VenuesPage() {
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const { data, isLoading, error } = api.venue.publicList.useQuery();

  const venues = useMemo(() => {
    const list = data ?? [];
    let filtered = list;
    if (query.trim()) {
      const term = query.toLowerCase();
      filtered = filtered.filter((venue) => {
        return (
          venue.name.toLowerCase().includes(term) ||
          venue.hotel.name.toLowerCase().includes(term) ||
          venue.hotel.city?.toLowerCase().includes(term)
        );
      });
    }

    if (cityFilter !== "all") {
      filtered = filtered.filter(
        (venue) => venue.hotel.city?.toLowerCase() === cityFilter
      );
    }

    if (priceFilter !== "all") {
      filtered = filtered.filter((venue) => {
        const price = venue.basePrice ? Number(venue.basePrice) : 0;
        if (priceFilter === "budget") return price > 0 && price <= 5000;
        if (priceFilter === "mid") return price > 5000 && price <= 15000;
        if (priceFilter === "premium") return price > 15000;
        return true;
      });
    }

    if (capacityFilter !== "all") {
      filtered = filtered.filter((venue) => {
        const capacity =
          venue.capacityBanquet ??
          venue.capacityReception ??
          venue.capacityTheater ??
          venue.capacityUshape ??
          0;
        if (capacityFilter === "small") return capacity > 0 && capacity <= 100;
        if (capacityFilter === "mid") return capacity > 100 && capacity <= 300;
        if (capacityFilter === "large") return capacity > 300;
        return true;
      });
    }

    return filtered;
  }, [data, query, cityFilter, priceFilter, capacityFilter]);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    (data ?? []).forEach((venue) => {
      if (venue.hotel.city) cities.add(venue.hotel.city.toLowerCase());
    });
    return ["all", ...Array.from(cities)];
  }, [data]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto px-4 pt-16 pb-10">
        <div className="flex flex-col gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary" className="w-fit">
              Ethiopia&apos;s Venue Marketplace
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Browse venues that match your event vision
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore verified hotels and venues, compare capacities, and send
              booking requests with confidence.
            </p>
          </div>
          <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-input bg-card px-4 py-2 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by venue, hotel, or city"
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">City</span>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="h-9 w-[160px] rounded-full">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city === "all" ? "All cities" : city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Price</span>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-9 w-[170px] rounded-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="budget">Budget (≤ 5k)</SelectItem>
                  <SelectItem value="mid">Mid (5k–15k)</SelectItem>
                  <SelectItem value="premium">Premium (15k+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Capacity</span>
              <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                <SelectTrigger className="h-9 w-[170px] rounded-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="small">Small (≤ 100)</SelectItem>
                  <SelectItem value="mid">Mid (100–300)</SelectItem>
                  <SelectItem value="large">Large (300+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-56 w-full" />
                <CardContent className="space-y-4 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
            {error.message || "Unable to load venues right now."}
          </div>
        )}

        {!isLoading && !error && venues.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-lg font-semibold">No venues found</p>
            <p className="text-muted-foreground">
              Try a different keyword or check back soon.
            </p>
          </div>
        )}

        {!isLoading && !error && venues.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => {
              const priceLabel = formatPrice(venue.basePrice);
              const coverImage = venue.images[0]?.url ?? "/hero.jpeg";
              const capacityLabel =
                venue.capacityBanquet ??
                venue.capacityReception ??
                venue.capacityTheater ??
                venue.capacityUshape;

              return (
                <Card key={venue.id} className="group overflow-hidden">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={coverImage}
                      alt={venue.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/60" />
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-card/80 text-foreground">
                        {venue.hotel.name}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {venue.hotel.city ?? "Addis Ababa"},{" "}
                          {venue.hotel.country ?? "Ethiopia"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {venue.description ?? "Premium venue ready for your next event."}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          Starting from
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          {priceLabel ?? "Contact for pricing"}
                        </div>
                        {capacityLabel && (
                          <div className="text-xs text-muted-foreground">
                            Up to {capacityLabel} guests
                          </div>
                        )}
                      </div>
                      <Button variant="secondary" asChild>
                        <Link href={`/venues/${venue.slug}`}>
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
