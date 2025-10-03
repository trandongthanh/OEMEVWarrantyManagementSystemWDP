"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
// import ModelViewer from "./ModelViewer";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Advanced mouse tracking for premium interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * 50);
        mouseY.set(y * 50);
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener("mousemove", handleMouseMove);
      return () => section.removeEventListener("mousemove", handleMouseMove);
    }
  }, [mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-white"
    >
      {/* Enhanced Video Background with Overlay - No competing background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-15"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="/videos/1436812-hd_2048_1080_24fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* Subtle section-specific accents only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.08),transparent_50%)]"></div>
      </div>{" "}
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </motion.div>
      {/* Premium Content Layout */}
      {/* Premium Content Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-16 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Enhanced Typography & Animations */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-12"
          >
            {/* Enhanced Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:border-white/30 transition-all duration-300"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm font-medium tracking-wide">
                PREMIUM WARRANTY SOLUTIONS
              </span>
            </motion.div>

            <div className="space-y-8">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="text-6xl lg:text-8xl font-extralight tracking-tight leading-[0.9]"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
                  Electric
                </span>
                <span className="block text-gray-400 font-thin">Vehicle</span>
                <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent font-light">
                  Redefined
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="space-y-6"
              >
                <p className="text-xl text-gray-300 max-w-lg leading-relaxed font-light">
                  Experience the pinnacle of automotive protection with our
                  comprehensive EV warranty solutions. Precision-engineered
                  coverage for the next generation of mobility.
                </p>

                <div className="flex items-center space-x-8 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Advanced Protection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span>Global Coverage</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Premium Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-5 rounded-full overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <span className="font-medium tracking-wide">
                    Explore Coverage
                  </span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative border border-white/30 text-white px-10 py-5 rounded-full backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-500"
              >
                <div className="flex items-center justify-center gap-3">
                  <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium tracking-wide">Watch Demo</span>
                </div>
              </motion.button>
            </motion.div>

            {/* Enhanced Stats with Premium Design */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="grid grid-cols-3 gap-8 pt-12 border-t border-white/10"
            >
              {[
                { value: "50K+", label: "Vehicles Protected", accent: "blue" },
                {
                  value: "99.8%",
                  label: "Customer Satisfaction",
                  accent: "green",
                },
                { value: "24/7", label: "Support Available", accent: "purple" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                  className="group text-center relative"
                >
                  <div className="relative bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm border border-gray-700/20 rounded-xl p-4 hover:border-gray-600/30 transition-all duration-300">
                    <div
                      className={`text-4xl font-extralight text-transparent bg-clip-text bg-gradient-to-r ${
                        stat.accent === "blue"
                          ? "from-blue-400 to-blue-200"
                          : stat.accent === "green"
                          ? "from-emerald-400 to-emerald-200"
                          : "from-purple-400 to-purple-200"
                      } mb-2 group-hover:scale-105 transition-transform duration-300`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400 font-light tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Simple 3D Model (Original Style) */}
          {/* <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden">
              <ModelViewer
                width={600}
                height={600}
                showScreenshotButton={false}
              />
            </div>
          </motion.div> */}
        </div>
      </div>
      {/* Premium Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{
            y: [0, 12, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="relative"
        >
          <div className="w-8 h-14 border border-white/30 rounded-full flex justify-center backdrop-blur-sm bg-white/5">
            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1.5 h-4 bg-gradient-to-b from-white to-gray-400 rounded-full mt-3"
            />
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 tracking-widest">
            SCROLL
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
