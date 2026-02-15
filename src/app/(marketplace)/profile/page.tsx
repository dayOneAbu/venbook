"use client";

import { authClient } from "~/server/better-auth/client"; 
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle2, 
  MessageSquare
} from "lucide-react";

import { Button } from "~/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/_components/ui/card";
import { Input } from "~/_components/ui/input";
import { Label } from "~/_components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/_components/ui/tabs";
import { Badge } from "~/_components/ui/badge";
import { Skeleton } from "~/_components/ui/skeleton";
import { api } from "~/trpc/react";
import Link from "next/link";
import Image from "next/image";

// Helper for status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "INQUIRY": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "TENTATIVE": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "CONFIRMED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "EXECUTED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "COMPLETED": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "CANCELLED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "CONFLICT": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function ProfilePage() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Fetch bookings
  const { data: bookings, isLoading: isBookingsLoading } = api.booking.getMyBookings.useQuery(undefined, {
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

  const handleUpdate = async () => {
    // Better Auth update profile logic
    toast.success("Profile updated successfully (Mock)");
  };

  if (isSessionPending) return <div className="container py-20 flex justify-center italic">Loading profile...</div>;
  if (!session) return <div className="container py-20 text-center">Please sign in to view your profile.</div>;

  const inquiries = bookings?.filter(b => ["INQUIRY", "TENTATIVE", "CONFLICT"].includes(b.status)) ?? [];
  const confirmedBookings = bookings?.filter(b => ["CONFIRMED", "EXECUTED", "COMPLETED"].includes(b.status)) ?? [];
  const pastBookings = bookings?.filter(b => ["CANCELLED"].includes(b.status)) ?? []; 

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name}!</h1>
        <p className="text-muted-foreground">Manage your bookings, inquiries, and account settings.</p>
      </div>

      <Tabs defaultValue="inquiries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-100">
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* INQUIRIES TAB */}
        <TabsContent value="inquiries" className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold">Active Inquiries</h2>
             <Button variant="outline" size="sm" asChild>
                <Link href="/venues">Find Venues</Link>
             </Button>
          </div>
          
          {isBookingsLoading ? (
             <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
             </div>
          ) : inquiries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No active inquiries</h3>
                <p className="text-muted-foreground mb-4">You have not requested any quotes yet.</p>
                <Button asChild>
                  <Link href="/venues">Explore Venues</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inquiries.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings" className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming & Past Bookings</h2>
          {isBookingsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : confirmedBookings.length === 0 && pastBookings.length === 0 ? (
             <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No confirmed bookings</h3>
                <p className="text-muted-foreground">Your confirmed events will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
                 {confirmedBookings.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Upcoming</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {confirmedBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))}
                        </div>
                    </div>
                 )}
                 {pastBookings.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">History / Cancelled</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-75">
                        {pastBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))}
                        </div>
                    </div>
                 )}
            </div>
          )}
        </TabsContent>

        {/* REVIEWS TAB (Placeholder) */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>My Reviews</CardTitle>
              <CardDescription>Reviews you&apos;ve left for venues.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No reviews yet</h3>
                <p className="text-muted-foreground">You can review venues after your event is completed.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                    id="email" 
                    value={email} 
                    disabled 
                    className="bg-muted"
                />
              </div>
              <div className="pt-4">
                <Button onClick={handleUpdate}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Define specific type for booking to avoid any
type BookingWithDetails = {
    id: string;
    status: string;
    eventName: string;
    eventDate: Date | string;
    startTime: Date | string;
    endTime: Date | string;
    guestCount: number;
    venue: {
        slug: string;
        name: string;
        images: { url: string }[];
    };
    hotel: {
        name: string;
    };
};

function BookingCard({ booking }: { booking: BookingWithDetails }) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-32 w-full bg-muted">
                {booking.venue.images?.[0]?.url ? (
                    <Image 
                        src={booking.venue.images[0].url} 
                        alt={booking.venue.name} 
                        fill 
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                        <MapPin className="h-8 w-8 opacity-20" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace("_", " ")}
                    </Badge>
                </div>
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">{booking.eventName}</h3>
                <p className="text-sm text-muted-foreground mb-3">{booking.venue.name} • {booking.hotel.name}</p>
                
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(booking.eventDate), "MMM d, yyyy")}</span>
                    </div>
                    {(booking.startTime && booking.endTime) && (
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                                {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{booking.guestCount} guests</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full" asChild>
                    <Link href={`/venues/${booking.venue.slug}`}>View Venue</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
