"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/_components/ui/card";
import { Button } from "~/_components/ui/button";
import { Loader2, Download, Database } from "lucide-react";

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const utils = api.useUtils();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch data on-demand
      const data = await utils.client.export.allData.query();
      
      // Create JSON blob
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `venbook-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Data export started");
    } catch (error) {
      toast.error("Failed to export data");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="border-green-100 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/10">
      <CardHeader>
        <div className="flex items-center gap-2">
           <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
           <CardTitle>Data Portability</CardTitle>
        </div>
        <CardDescription>
          Download a complete copy of your hotel&apos;s data (Bookings, Customers, Venues) in JSON format.
          We believe you should always own your data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
            onClick={handleExport} 
            disabled={isExporting}
            variant="outline"
            className="w-full sm:w-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing Export...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download All Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
