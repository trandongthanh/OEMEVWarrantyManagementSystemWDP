"use client";

import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { WarrantyTypesSection } from "../components/WarrantyTypesSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { Footer } from "../components/Footer";
import { GuestChatWidget } from "../components/chat";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Unified Global Background System */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 -z-10"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.015),transparent_70%)] -z-10"></div>
      <div className="fixed top-0 left-0 w-full h-full bg-[linear-gradient(135deg,transparent_25%,rgba(59,130,246,0.025)_50%,transparent_75%)] -z-10"></div>

      {/* Animated Global Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.008] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      </div>

      {/* Section Transition Gradients - Creates smooth flow between sections */}
      <div className="fixed inset-0 -z-5">
        {/* Hero to Features transition */}
        <div className="absolute top-[100vh] left-0 w-full h-48 bg-gradient-to-b from-transparent to-emerald-500/[0.02] opacity-50"></div>

        {/* Features to Warranty transition */}
        <div className="absolute top-[180vh] left-0 w-full h-48 bg-gradient-to-b from-emerald-500/[0.02] via-transparent to-blue-500/[0.03] opacity-50"></div>

        {/* Warranty to Testimonials transition */}
        <div className="absolute top-[260vh] left-0 w-full h-48 bg-gradient-to-b from-blue-500/[0.03] via-transparent to-emerald-500/[0.025] opacity-50"></div>

        {/* Testimonials to Footer transition */}
        <div className="absolute top-[340vh] left-0 w-full h-48 bg-gradient-to-b from-emerald-500/[0.025] to-purple-500/[0.02] opacity-50"></div>
      </div>

      {/* Floating elements for visual enhancement */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div
          className="absolute top-[40%] right-[15%] w-1 h-1 bg-emerald-400/30 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-[60%] left-[20%] w-3 h-3 bg-purple-400/10 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-[80%] right-[10%] w-1.5 h-1.5 bg-pink-400/20 rounded-full animate-bounce"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <Header />
      <main className="pt-20 relative z-10">
        <HeroSection />
        <FeaturesSection />
        <WarrantyTypesSection />
        <TestimonialsSection />
      </main>
      <Footer />

      {/* Guest Chat Widget - Floating chat for anonymous visitors */}
      <GuestChatWidget serviceCenterId="default-service-center" />
    </div>
  );
}
