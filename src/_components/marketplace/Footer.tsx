import Link from "next/link";
import { Hotel, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <Hotel className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tighter">VENBOOK</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ethiopia&apos;s most trusted venue booking platform. Elevating event management for luxury hotels and planners.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/venues" className="text-muted-foreground hover:text-primary transition-colors">All Venues</Link></li>
              <li><Link href="/#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/venues?category=ballroom" className="text-muted-foreground hover:text-primary transition-colors">Ballrooms</Link></li>
              <li><Link href="/venues?category=conference" className="text-muted-foreground hover:text-primary transition-colors">Conference Halls</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">For Owners</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/auth/owner/sign-up" className="text-muted-foreground hover:text-primary transition-colors">List Your Property</Link></li>
              <li><Link href="/auth/owner/sign-in" className="text-muted-foreground hover:text-primary transition-colors">Partner Login</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Owner Guide</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Bole District, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>hello@venbook.et</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>+251 911 123 456</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VenBook. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
