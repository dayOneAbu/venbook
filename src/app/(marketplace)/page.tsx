"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "~/_components/ui/button";
import { ArrowRight, Hotel, MapPin, Search, Star, ShieldCheck, Zap } from "lucide-react";
import FadeContent from "~/_components/FadeContent";
import BlurText from "~/_components/BlurText";
import { authClient } from "~/server/better-auth/client";

export default function Home() {
  const ownerRedirect = encodeURIComponent("/onboard?role=owner");
  const { data: session } = authClient.useSession();
  const customerOnboardRedirect = encodeURIComponent(
    "/onboard?role=customer&next=/venues"
  );
  const exploreHref = session
    ? "/venues"
    : `/auth/customer/sign-up?redirect=${customerOnboardRedirect}`;

  return (
    <div className="flex flex-col gap-24 pb-32 overflow-x-hidden bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero.jpeg"
            alt="Luxury Ballroom"
            fill
            className="object-cover brightness-[0.55]"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/20 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl space-y-8">
            <div className="space-y-4">
              <BlurText
                text="Discover the Perfect Venue for Your Elite Moments"
                className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
              />
              <FadeContent delay={0.6}>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                  The most trusted platform in Ethiopia for discovering premium ballrooms, 
                  conference halls, and exclusive event spaces.
                </p>
              </FadeContent>
            </div>

            <FadeContent delay={0.9} className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20" asChild>
                <Link href={exploreHref}>
                  Explore Venues
                  <Search className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg rounded-full bg-card/20 backdrop-blur-md border-border text-foreground hover:bg-card/40"
                asChild
              >
                <Link href={`/auth/owner/sign-up?redirect=${ownerRedirect}`}>
                  List Your Property
                  <Hotel className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </FadeContent>
          </div>
        </div>
      </section>

      {/* Trust & Stats */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-border">
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold">500+</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider font-medium">Venues</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold">10k+</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider font-medium">Monthly Users</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold">4.9/5</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider font-medium">User Rating</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold">Addis Ababa</div>
            <div className="text-muted-foreground text-sm uppercase tracking-wider font-medium">Prime Focus</div>
          </div>
        </div>
      </section>

      {/* dual Segment Focus */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Seeker Side */}
          <FadeContent delay={0.2} className="relative group p-8 rounded-3xl border border-border bg-card/60 hover:bg-card transition-colors overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MapPin className="h-32 w-32" />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Star className="h-6 w-6 fill-current" />
                </div>
                <h3 className="text-3xl font-bold">Planning an Event?</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Browse through Addis Ababa&apos;s most exclusive venues. From intimate weddings 
                  to grand corporate summits, find the space that matches your vision.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Verified listings only
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Real-time availability
                  </li>
                </ul>
                <Button variant="link" className="p-0 text-lg group/btn" asChild>
                  <Link href="/venues">
                    Start Browsing
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
             </div>
          </FadeContent>

          {/* Owner Side */}
          <FadeContent delay={0.4} className="relative group p-8 rounded-3xl border border-border bg-primary/10 text-foreground hover:bg-primary/15 transition-colors overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Hotel className="h-32 w-32" />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Hotel className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold">Hotel & Venue Owners</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Modernize your booking operations. Manage calendars, payments, and 
                  inquiries on Ethiopia&apos;s first dedicated venue SaaS platform.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    Custom subdomain for your hotel
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-purple-400" />
                    Automated tax & billing
                  </li>
                </ul>
                <Button variant="link" className="p-0 text-lg group/btn" asChild>
                  <Link href={`/auth/owner/sign-up?redirect=${ownerRedirect}`}>
                    Register Your Venue
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
             </div>
          </FadeContent>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="container mx-auto px-4 bg-muted py-24 rounded-[3rem]">
        <div className="max-w-xl mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Exceptional Spaces</h2>
          <p className="text-muted-foreground text-lg">
            Our most popular venues this month, selected for their service excellence and atmosphere.
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <FadeContent key={i} delay={i * 0.1}>
              <div className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-2xl">
                <div className="aspect-4/3 w-full bg-muted relative">
                   <div className="absolute inset-0 flex items-center justify-center bg-muted group-hover:scale-105 transition-transform duration-500">
                      <span className="text-muted-foreground text-sm font-medium">Luxury Venue {i} Photo</span>
                   </div>
                   <div className="absolute top-4 left-4">
                      <span className="bg-card/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-primary">
                        Featured
                      </span>
                   </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold">Grand Ballroom {i}</h3>
                  <div className="flex items-center text-muted-foreground text-sm gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Bole, Addis Ababa</span>
                  </div>
                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Starting from</span>
                      <span className="font-bold text-lg text-primary">$450 <span className="text-sm font-normal text-muted-foreground">/day</span></span>
                    </div>
                    <Button variant="secondary" size="sm" className="rounded-full px-5" asChild>
                      <Link href={`/venues/${i}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </FadeContent>
          ))}
        </div>
      </section>
    </div>
  );
}
