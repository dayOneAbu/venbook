"use client";

import { api } from "~/trpc/react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/_components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/_components/ui/table";
import { Badge } from "~/_components/ui/badge";
import { Loader2 } from "lucide-react";

export function SecurityLogs() {
  const { data, isLoading } = api.audit.getLogs.useQuery({ limit: 20 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security & Activity Log</CardTitle>
        <CardDescription>
          Monitor who is accessing your account and what actions they are taking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.actor.name ?? "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{log.actor.email}</span>
                        {log.actor.role === "SUPER_ADMIN" && (
                          <Badge variant="outline" className="mt-1 w-fit text-[10px]">
                            Venbook Admin
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{log.action.replace(/_/g, " ")}</TableCell>
                    <TableCell className="capitalize">{log.resource}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground" title={log.details ?? ""}>
                      {log.details}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM d, h:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No activity recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
