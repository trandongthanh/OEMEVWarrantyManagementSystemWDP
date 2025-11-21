"use client";

import { motion } from "framer-motion";
import MagicBento from "./MagicBento";

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      {/* Subtle section-specific accent only */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.04),transparent_60%)]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Enhanced Title Section */}
          <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-300 font-medium tracking-wider">
              PREMIUM FEATURES
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-light mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
            Why Choose Our EV Warranty
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience peace of mind with our comprehensive warranty solutions
            designed specifically for electric vehicles and their unique
            requirements.
          </p>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <span>Advanced Protection</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>Expert Service</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <span>Nationwide Coverage</span>
            </div>
          </div>
        </motion.div>
        <div className="flex justify-center">
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={10}
            glowColor="255, 255, 255"
          />
        </div>{" "}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-16 overflow-hidden">
            {/* Enhanced gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.1),transparent_70%)]"></div>

            {/* Enhanced animated dots with more sophistication */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                className="absolute top-8 left-8 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute top-12 right-16 w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.8, 1],
                  rotate: [360, 0, 360],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1,
                }}
              />
              <motion.div
                className="absolute bottom-16 left-20 w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                animate={{
                  opacity: [0.4, 0.9, 0.4],
                  scale: [1, 1.3, 1],
                  rotate: [0, -180, -360],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 2,
                }}
              />
              <motion.div
                className="absolute top-1/2 right-8 w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 2, 1],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1.5,
                }}
              />
            </div>

            {/* Title with staggered word animation */}
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-4xl lg:text-5xl font-light mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white"
              >
                {["Ready", "to", "Protect", "Your", "Investment?"].map(
                  (word, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: 0.7 + index * 0.1,
                        ease: "easeOut",
                      }}
                      className="inline-block mr-3"
                    >
                      {word}
                    </motion.span>
                  )
                )}
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                Join thousands of EV owners who trust us with comprehensive
                warranty protection and unmatched service excellence.
              </motion.p>

              {/* Enhanced CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="mb-8"
              >
                <motion.button
                  className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-4 px-8 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 tracking-wide">
                    Get Your Quote Today
                  </span>
                </motion.button>
              </motion.div>

              {/* Enhanced trust indicators */}
              <motion.div
                className="flex justify-center items-center gap-8 text-gray-400 text-sm font-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                  <span>75,000+ Protected</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.5,
                    }}
                  />
                  <span>99.9% Satisfaction</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                    animate={{
                      opacity: [0.4, 0.9, 0.4],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 1,
                    }}
                  />
                  <span>24/7 Support</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
