"use client";

import nextDynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import SocketGuard from "@/components/SocketGuard";

// Dynamically import NotificationProvider to prevent SSR socket issues
const NotificationProvider = nextDynamic(
  () =>
    import("@/contexts/NotificationContext").then(
      (mod) => mod.NotificationProvider
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    ),
  }
);

// Wrap children in dynamic import to prevent SSR
const DynamicContent = nextDynamic(
  () =>
    Promise.resolve(({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    )),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    ),
  }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketGuard>
      <NotificationProvider>
        <DynamicContent>{children}</DynamicContent>
      </NotificationProvider>
    </SocketGuard>
  );
}
