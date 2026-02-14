"use client";

import Link from "next/link";
import { authClient } from "~/server/better-auth/client";
import { Button } from "~/_components/ui/button";
import { LogOut, User, Menu, Hotel, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/_components/ui/dropdown-menu";
import { useState } from "react";

export function Navbar() {
  const { data: session } = authClient.useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Hotel className="h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tighter">VENBOOK</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/venues" className="text-sm font-medium hover:text-primary transition-colors">Explore</Link>
            <Link href="/#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-border">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>
                  <p className="text-sm font-bold">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">{session.user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">Profile</Link>
                </DropdownMenuItem>
                {session.user.role === "OWNER" || session.user.role === "STAFT" ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/tenant/skylight/admin`} className="cursor-pointer font-bold text-primary">Admin Dashboard</Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="rounded-full hidden sm:flex" asChild>
                <Link href="/auth/customer/sign-in">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button className="rounded-full" asChild>
                <Link href="/auth/customer/sign-up">Get Started</Link>
              </Button>
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu Placeholder */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-4">
          <Link href="/venues" className="block text-sm font-medium">Explore Venues</Link>
          <Link href="/#features" className="block text-sm font-medium">Features</Link>
        </div>
      )}
    </nav>
  );
}
