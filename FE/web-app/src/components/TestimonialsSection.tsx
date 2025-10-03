"use client";

import { motion } from "framer-motion";
import ThreeDTestimonialRing from "./ThreeDTestimonialRing";

// Testimonial data
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Tesla Model 3",
    content:
      "Charging port fixed in 24 hours. The mobile app made everything seamless.",
    rating: 5,
    avatar: "👩‍💼",
  },
  {
    name: "Michael Rodriguez",
    role: "Nissan Leaf",
    content: "Saved $3,200 on battery replacement. Best investment for my EV.",
    rating: 5,
    avatar: "👨‍🔧",
  },
  {
    name: "Emily Johnson",
    role: "BMW i4",
    content:
      "Professional service, comprehensive coverage. They understand EVs.",
    rating: 5,
    avatar: "👩‍🚗",
  },
  {
    name: "David Park",
    role: "Ford Mach-E",
    content:
      "Fixed and upgraded my system at no extra cost. Amazing experience.",
    rating: 5,
    avatar: "👨‍💻",
  },
  {
    name: "Maria Santos",
    role: "Chevrolet Bolt",
    content:
      "Quick response, transparent pricing. I recommend them to everyone.",
    rating: 5,
    avatar: "👩‍⚕️",
  },
];

const stats = [
  { value: "75,000+", label: "Happy Customers" },
  { value: "99.9%", label: "Satisfaction Rate" },
  { value: "< 2hrs", label: "Average Response Time" },
  { value: "800+", label: "Service Centers" },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 relative">
      {/* Subtle section-specific accent only */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(16,185,129,0.05),transparent_60%)]"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group text-center relative"
            >
              <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-3xl lg:text-4xl font-light mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Testimonials Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-300 font-medium tracking-wider">
              CUSTOMER TESTIMONIALS
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-light mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white">
            Customer Stories
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Real experiences from EV owners who trust our warranty solutions
          </p>

          {/* Trust divider */}
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto mt-6"></div>
        </motion.div>

        {/* Testimonials Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20 px-4 lg:px-8">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8 max-w-lg mx-auto lg:mx-0"
            >
              <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-2xl"></div>
                <div className="relative z-10">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-2xl lg:text-3xl font-light mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white"
                  >
                    Why customers choose us
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-gray-300 leading-relaxed mb-8"
                  >
                    Thousands of EV owners trust our warranty solutions for
                    comprehensive coverage and exceptional service.
                  </motion.p>
                </div>
              </div>

              {/* Enhanced Key Features */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                {[
                  {
                    title: "24/7 Support",
                    desc: "Round-the-clock assistance",
                    color: "emerald",
                  },
                  {
                    title: "Nationwide Coverage",
                    desc: "800+ certified service centers",
                    color: "blue",
                  },
                  {
                    title: "Quick Claims",
                    desc: "Simple digital process",
                    color: "purple",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-800/20 to-gray-900/20 border border-gray-700/20 hover:border-gray-600/30 transition-all duration-300"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-3 flex-shrink-0 ${
                        feature.color === "emerald"
                          ? "bg-emerald-400"
                          : feature.color === "blue"
                          ? "bg-blue-400"
                          : "bg-purple-400"
                      }`}
                    ></div>
                    <div>
                      <h4 className="font-light text-white mb-1 group-hover:text-blue-100 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - 3D Testimonial Ring */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative max-w-lg mx-auto lg:mx-0 h-[600px] flex items-center justify-center"
            >
              <ThreeDTestimonialRing
                testimonials={testimonials}
                width={600}
                perspective={1500}
                cardDistance={300}
                initialRotation={1}
                animationDuration={3}
                staggerDelay={0.2}
                hoverOpacity={0.3}
                draggable={true}
                mobileBreakpoint={768}
                mobileScaleFactor={0.7}
                containerClassName="rounded-lg"
                cardClassName="shadow-lg shadow-white/10"
              />
            </motion.div>
          </div>
        </div>

        {/* Enhanced Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-300 font-medium tracking-wider">
              CERTIFIED & TRUSTED
            </span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {[
              { name: "ISO 9001", color: "emerald" },
              { name: "BBB A+", color: "blue" },
              { name: "NADA", color: "purple" },
              { name: "EV Partner", color: "indigo" },
            ].map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl px-6 py-4 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 font-light text-white group-hover:text-blue-100 transition-colors text-sm">
                  {badge.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
