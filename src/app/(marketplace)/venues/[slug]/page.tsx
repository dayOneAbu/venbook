"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/_components/ui/button";
import { Badge } from "~/_components/ui/badge";
import { Card, CardContent } from "~/_components/ui/card";
import { Skeleton } from "~/_components/ui/skeleton";
import { MapPin, ArrowLeft, Users, Phone, Mail, Globe } from "lucide-react";
import { Gallery } from "~/_components/marketplace/Gallery";
import { BookingRequestModal } from "~/_components/marketplace/BookingRequestModal";

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
          <Skeleton className="h-96 w-full rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
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
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/venues">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Explore all venues
            </Link>
          </Button>
          <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/30 text-primary">
            Verified Venue
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
               <h1 className="text-4xl md:text-5xl font-black tracking-tight">{data.name}</h1>
               <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-lg">
                  {data.hotel.name} &bull; {data.hotel.city ?? "Addis Ababa"}, {data.hotel.country ?? "Ethiopia"}
                </span>
              </div>
            </div>
            
            <div className="hidden md:block">
               <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Starting from</div>
                  <div className="text-3xl font-black text-primary">{priceLabel ?? "Inquire"}</div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {/* Gallery Component */}
            <Gallery images={data.images} venueName={data.name} />

            <div className="grid gap-6">
              <Card className="border-none shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm">
                <CardContent className="space-y-4 p-8">
                  <h2 className="text-2xl font-bold">About this venue</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {data.description ??
                      "This premium venue provides a sophisticated Experience world-class hospitality and state-of-the-art facilities."}
                  </p>
                  
                  <div className="pt-4 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Key Amenities</h3>
                    {data.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.amenities.map((amenity) => (
                          <Badge key={amenity.amenity.name} variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-primary/10">
                            {amenity.amenity.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No specific amenities listed yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 border border-primary/10 shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center justify-between text-primary-foreground">
                <span className="font-bold flex items-center gap-2">
                   <Users className="h-4 w-4" />
                   Up to {capacityLabel ?? "---"} Pax
                </span>
                <span className="text-sm opacity-90">Instant Inquiry</span>
              </div>
              <CardContent className="space-y-6 p-8">
                <div className="md:hidden">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Starting from</div>
                  <div className="text-3xl font-black text-primary">{priceLabel ?? "Inquire"}</div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Send an inquiry directly to <strong>{data.hotel.name}</strong> event team. 
                    They will contact you within 24 hours with a personalized quote.
                  </p>
                  <BookingRequestModal 
                    venueId={data.id} 
                    venueName={data.name} 
                    trigger={
                      <Button className="w-full h-12 text-md font-bold rounded-xl shadow-lg shadow-primary/20" size="lg">
                        Request a Quote
                      </Button>
                    }
                  />
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Venue Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reception</p>
                        <p className="text-sm font-medium">{data.hotel.phone ?? "---"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sales Dept</p>
                        <p className="text-sm font-medium truncate w-40">{data.hotel.email ?? "---"}</p>
                      </div>
                    </div>
                    {data.hotel.website && (
                      <div className="flex items-center gap-4 group">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Website</p>
                          <Link href={data.hotel.website} className="text-sm font-medium text-primary hover:underline">
                            Official Site
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
