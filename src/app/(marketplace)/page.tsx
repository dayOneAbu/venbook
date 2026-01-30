import Link from "next/link";
import { Button } from "~/_components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Book the Perfect Venue for Your <span className="text-primary italic">Elegant</span> Event
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              The premier platform for banquet and event management in Ethiopia. 
              Find, book, and execute flawless events with local reliability.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/venues">Browse Venues</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/sign-up">Host Your Venue</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Gradient */}
        <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.15),transparent)]" />
      </section>

      {/* Featured Venues Section */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Handpicked Venues</h2>
          <p className="text-muted-foreground max-w-150">
            Explore top-rated ballrooms, conference halls, and meeting spaces in Addis Ababa.
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg">
              <div className="aspect-video w-full bg-muted flex items-center justify-center">
                 <span className="text-muted-foreground italic">Venue Image Placeholder</span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold">Elegant Ballroom {i}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  A spacious and luxurious hall perfect for weddings and large corporate gatherings. 
                  Capacity up to 500 guests.
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold text-primary">From $500</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/venues/${i}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
