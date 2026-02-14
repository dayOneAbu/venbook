"use client";

import { Bell } from "lucide-react";
import { Button } from "~/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/_components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

export function NotificationBell() {
  const { data: notifications, refetch } = api.notification.getRecent.useQuery();
  const markRead = api.notification.markRead.useMutation({
    onSuccess: () => refetch(),
  });
  const markAllRead = api.notification.markAllRead.useMutation({
    onSuccess: () => refetch(),
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications?.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications?.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-4 cursor-default focus:bg-accent",
                  !notification.isRead && "bg-accent/50"
                )}
                onClick={() => {
                  if (!notification.isRead) {
                    markRead.mutate({ id: notification.id });
                  }
                }}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-semibold text-sm">{notification.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
