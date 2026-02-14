"use client";

import { api } from "~/trpc/react";
import FadeContent from "~/_components/FadeContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/_components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/_components/ui/table";
import { Badge } from "~/_components/ui/badge";
import { Building2, MapPin } from "lucide-react";

export default function HotelsPage() {
  const { data, isLoading } = api.hotel.adminGetAll.useQuery({});

  return (
    <div className="space-y-6">
      <FadeContent duration={0.6}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hotel Management</h2>
          <p className="text-muted-foreground">
            Manage all properties registered on the VenBook platform.
          </p>
        </div>
      </FadeContent>

      <FadeContent delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Registered Hotels</CardTitle>
            <CardDescription>
              A comprehensive list of all verified and pending properties.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      Loading hotels...
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.hotels?.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <Building2 className="h-4 w-4 text-muted-foreground" />
                             <span>{hotel.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5">{hotel.subdomain}.venbook.com</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{hotel.city}, {hotel.country}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                           {hotel.email && (
                             <span className="text-muted-foreground">{hotel.email}</span>
                           )}
                           {hotel.phone && (
                             <span className="text-muted-foreground font-mono text-xs">{hotel.phone}</span>
                           )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={hotel.isVerified ? "default" : "secondary"}>
                          {hotel.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!isLoading && !data?.hotels?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      No hotels found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </FadeContent>
    </div>
  );
}
