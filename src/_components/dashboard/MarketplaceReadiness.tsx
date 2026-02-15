"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { Progress } from "~/_components/ui/progress";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";

export function MarketplaceReadiness() {
  const { data, isLoading } = api.hotel.getMarketplaceReadiness.useQuery();

  if (isLoading || !data) return null;

  // Don't show if 100% complete? Actually, maybe show a "You're ready!" message.
  if (data.score === 100) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50/50 p-6 dark:border-green-900/50 dark:bg-green-950/10">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-500 p-1">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">Marketplace Ready!</h3>
            <p className="text-sm text-green-800/80 dark:text-green-100/60">
              Your profile is high-quality and ready for visitors. Our team will review your TIN number for final verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Marketplace Readiness</h2>
          <p className="text-sm text-muted-foreground">
            Complete your profile to instill confidence in your visitors.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{data.score}%</span>
        </div>
      </div>

      <Progress value={data.score} className="h-2" />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.tasks.map((task) => {
          const href = task.href;
          
          return (
            <Link
              key={task.id}
              href={href}
              className={cn(
                "group flex items-start gap-3 rounded-lg border p-3 transition-colors",
                task.completed 
                  ? "bg-muted/50 border-transparent opacity-60" 
                  : "bg-card hover:bg-muted/30 border-border"
              )}
            >
              {task.completed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 text-muted-foreground group-hover:text-primary" />
              )}
              <div className="flex-1 space-y-1">
                <p className={cn(
                  "text-sm font-medium leading-none",
                  task.completed ? "line-through text-muted-foreground" : ""
                )}>
                  {task.label}
                </p>
                {!task.completed && (
                  <div className="flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Complete now <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
