"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/_components/ui/button";
import { ModeToggle } from "~/_components/mode-toggle";
import { api } from "~/trpc/react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "~/_components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { SignOutButton } from "~/_components/sign-out-button";

import { authClient } from "~/server/better-auth/client";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  
  const isLoggedIn = !!session;
  const user = session?.user;
  // @ts-ignore - role is added in better-auth config
  const userRole = user?.role ?? "CUSTOMER";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">VenBook</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link
              href="/venues"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/venues" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Browse Venues
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                {userRole !== "CUSTOMER" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                   <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/sign-in">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
