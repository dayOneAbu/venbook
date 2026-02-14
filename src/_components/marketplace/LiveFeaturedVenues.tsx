"use client";

import { api, type RouterOutputs } from "~/trpc/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/_components/ui/button";
import { MapPin } from "lucide-react";
import FadeContent from "~/_components/FadeContent";
import { Skeleton } from "~/_components/ui/skeleton";

type Venue = RouterOutputs["venue"]["publicList"][number];

export function LiveFeaturedVenues() {
  const { data: venues, isLoading } = api.venue.publicList.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="rounded-[2.5rem] border border-border bg-card overflow-hidden">
            <Skeleton className="aspect-16/10 w-full" />
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="pt-6 border-t border-border flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-12 w-24 rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!venues || venues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground italic">No featured venues available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {venues?.slice(0, 3).map((venue: Venue, i: number) => (
        <FadeContent key={venue.id} delay={i * 0.1}>
          <div className="group overflow-hidden rounded-[2.5rem] border border-border bg-card transition-all hover:shadow-3xl hover:-translate-y-2">
            <div className="aspect-16/10 w-full relative overflow-hidden bg-muted">
               {venue.images[0]?.url ? (
                 <Image
                    src={venue.images[0].url}
                    alt={venue.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                 />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs uppercase font-black">
                   No Image
                 </div>
               )}
               <div className="absolute top-6 left-6">
                  <span className="bg-card/80 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-primary border border-border shadow-lg">
                    Featured
                  </span>
               </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight line-clamp-1">{venue.name}</h3>
                <div className="flex items-center text-muted-foreground text-sm font-medium gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{venue.hotel.city}, Ethiopia</span>
                </div>
              </div>
              <div className="pt-6 border-t border-border flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Daily Rate</span>
                  <span className="font-black text-2xl text-primary">
                    {venue.basePrice?.toLocaleString()} <span className="text-sm font-normal text-muted-foreground tracking-normal uppercase">ETB</span>
                  </span>
                </div>
                <Button variant="outline" size="lg" className="rounded-2xl px-6 border-border hover:bg-primary hover:text-white hover:border-primary transition-all font-bold" asChild>
                  <Link href={`/venues/${venue.slug}`}>Explore</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeContent>
      ))}
    </div>
  );
}
