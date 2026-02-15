"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "~/_components/ui/button";
import { ArrowRight, Hotel, MapPin, Search, Star, ShieldCheck, Zap } from "lucide-react";
import FadeContent from "~/_components/FadeContent";
import BlurText from "~/_components/ui/BlurText";
import { authClient } from "~/server/better-auth/client";
import { LiveFeaturedVenues } from "~/_components/marketplace/LiveFeaturedVenues";

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
            src="/images/hero-ballroom.png"
            alt="Luxury Ballroom"
            fill
            className="object-cover brightness-[0.45]"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/80 via-transparent to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl space-y-10">
            <div className="space-y-6">
              <BlurText
                text="The Premier Destination for Ethiopia's Finest Venues"
                className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-[1.05]"
              />
              <FadeContent delay={0.6}>
                <p className="text-xl md:text-2xl text-white/80 max-w-2xl leading-relaxed">
                  Discover and book the most exclusive ballrooms, conference halls, 
                  and event spaces in Addis Ababa with seamless digital management.
                </p>
              </FadeContent>
            </div>

            <FadeContent delay={0.9} className="flex flex-wrap gap-5 pt-4">
              <Button size="lg" className="h-16 px-10 text-xl rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-105" asChild>
                <Link href={exploreHref}>
                  Explore Venues
                  <Search className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-10 text-xl rounded-2xl bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105"
                asChild
              >
                <Link href={`/auth/owner/sign-up?redirect=${ownerRedirect}`}>
                  List Your Property
                  <Hotel className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </FadeContent>
          </div>
        </div>
      </section>

      {/* Trust & Stats */}
      <section className="container mx-auto px-4 -mt-32 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-[2.5rem] bg-card/80 backdrop-blur-2xl border border-border shadow-2xl">
          <div className="text-center space-y-1 p-6 rounded-2xl hover:bg-primary/5 transition-colors">
            <div className="text-4xl font-black text-primary">500+</div>
            <div className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold">Venues</div>
          </div>
          <div className="text-center space-y-1 p-6 rounded-2xl hover:bg-primary/5 transition-colors">
            <div className="text-4xl font-black text-primary">12k+</div>
            <div className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold">Bookings</div>
          </div>
          <div className="text-center space-y-1 p-6 rounded-2xl hover:bg-primary/5 transition-colors">
            <div className="text-4xl font-black text-primary">4.9/5</div>
            <div className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold">User Rating</div>
          </div>
          <div className="text-center space-y-1 p-6 rounded-2xl hover:bg-primary/5 transition-colors">
            <div className="text-4xl font-black text-primary">Verified</div>
            <div className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold">Host Standards</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything you need to host or find the perfect event</h2>
          <p className="text-muted-foreground text-lg">
            VenBook bridges the gap between luxury hospitality and modern event planning.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: "Curated Selection", desc: "Hand-picked premium venues across Ethiopia's major hubs." },
              { icon: Zap, title: "Instant Booking", desc: "Real-time availability and smart inquiry management system." },
              { icon: ShieldCheck, title: "Secure Payments", desc: "Compliant billing with full support for local tax strategies." }
            ].map((feature, i) => (
              <FadeContent key={i} delay={i * 0.15} className="p-8 rounded-[2rem] border border-border bg-card/50 hover:border-primary/50 transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </FadeContent>
            ))}
        </div>
      </section>

      {/* dual Segment Focus */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Seeker Side */}
          <FadeContent delay={0.2} className="relative group p-10 rounded-[3rem] border border-border bg-card/60 hover:bg-card transition-all overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <MapPin className="h-64 w-64" />
             </div>
             <div className="relative z-10 space-y-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Star className="h-7 w-7 fill-current" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-extrabold tracking-tight">Planning an Event?</h3>
                  <p className="text-muted-foreground text-xl leading-relaxed">
                    Browse through Addis Ababa&apos;s most exclusive venues. From intimate weddings 
                    to grand corporate summits, find the space that matches your vision.
                  </p>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                      <ShieldCheck className="h-3 w-3 text-green-500" />
                    </div>
                    Verified listings only
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-amber-500" />
                    </div>
                    Real-time availability
                  </li>
                </ul>
                <Button size="lg" variant="link" className="p-0 text-xl font-bold group/btn hover:no-underline" asChild>
                  <Link href="/venues">
                    Start Browsing
                    <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover/btn:translate-x-2" />
                  </Link>
                </Button>
             </div>
          </FadeContent>

          {/* Owner Side */}
          <FadeContent delay={0.4} className="relative group p-10 rounded-[3rem] border border-transparent bg-primary/10 text-foreground hover:bg-primary/15 transition-all overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                <Hotel className="h-64 w-64" />
             </div>
             <div className="relative z-10 space-y-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <Hotel className="h-7 w-7" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-extrabold tracking-tight text-primary">Hotel & Venue Owners</h3>
                  <p className="text-muted-foreground text-xl leading-relaxed">
                    Modernize your booking operations. Manage calendars, payments, and 
                    inquiries on Ethiopia&apos;s first dedicated venue SaaS platform.
                  </p>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <div className="h-5 w-5 rounded-full bg-blue-400/10 flex items-center justify-center">
                      <ShieldCheck className="h-3 w-3 text-blue-400" />
                    </div>
                    Custom dashboard
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <div className="h-5 w-5 rounded-full bg-purple-400/10 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-purple-400" />
                    </div>
                    Automated tax compliance
                  </li>
                </ul>
                <Button size="lg" variant="link" className="p-0 text-xl font-bold text-primary group/btn hover:no-underline" asChild>
                  <Link href={`/auth/owner/sign-up?redirect=${ownerRedirect}`}>
                    Register Your Property
                    <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover/btn:translate-x-2" />
                  </Link>
                </Button>
             </div>
          </FadeContent>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="container mx-auto px-4 bg-muted/40 py-24 rounded-[4rem] border border-muted">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Exceptional Spaces</h2>
          <p className="text-muted-foreground text-xl">
            Selected for their service excellence and unmatched atmosphere.
          </p>
        </div>
        
        <LiveFeaturedVenues />
      </section>
    </div>
  );
}
