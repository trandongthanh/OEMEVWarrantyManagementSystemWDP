"use client";

import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { TrackingWidget } from "../../components/TrackingWidget";

export default function TrackPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 -z-10"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.015),transparent_70%)] -z-10"></div>

      <Header />

      <main className="pt-32 pb-20 relative z-10 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <TrackingWidget />
        </div>
      </main>

      <Footer />
    </div>
  );
}
