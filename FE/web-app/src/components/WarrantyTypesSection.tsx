"use client";

import { motion } from "framer-motion";
import {
  ThreeDScrollTriggerContainer,
  ThreeDScrollTriggerRow,
} from "./ThreeDScrollTrigger";
import { Battery, Zap, Cog, Smartphone } from "lucide-react";

// SVG Brand Logo Components
const BrandLogos = {
  Tesla: () => (
    <svg viewBox="0 0 80 40" className="w-16 h-8 fill-white">
      <path d="M40 5 L35 15 L30 5 L20 5 L20 35 L25 35 L25 15 L30 25 L35 15 L35 35 L40 35 L40 15 L45 25 L50 15 L50 35 L55 35 L55 5 L45 5 Z" />
    </svg>
  ),
  BMW: () => (
    <svg viewBox="0 0 40 40" className="w-10 h-10 fill-white">
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M20 2 A18 18 0 0 1 20 38 A18 18 0 0 1 20 2 Z M20 2 L20 20 L38 20 A18 18 0 0 1 20 38 L20 20 L2 20 A18 18 0 0 1 20 2"
        opacity="0.3"
      />
      <circle cx="20" cy="20" r="3" fill="white" />
    </svg>
  ),
  Mercedes: () => (
    <svg viewBox="0 0 40 40" className="w-10 h-10 fill-white">
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M20 8 L12 28 L28 28 Z M20 8 L20 20 M12 28 L20 20 M28 28 L20 20"
        strokeWidth="2"
        stroke="white"
        fill="none"
      />
    </svg>
  ),
  Audi: () => (
    <svg viewBox="0 0 80 30" className="w-16 h-8 fill-none stroke-white">
      <circle cx="15" cy="15" r="12" strokeWidth="2" />
      <circle cx="30" cy="15" r="12" strokeWidth="2" />
      <circle cx="50" cy="15" r="12" strokeWidth="2" />
      <circle cx="65" cy="15" r="12" strokeWidth="2" />
    </svg>
  ),
  Ford: () => (
    <svg viewBox="0 0 60 30" className="w-16 h-8 fill-white">
      <ellipse
        cx="30"
        cy="15"
        rx="28"
        ry="13"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <text x="30" y="18" textAnchor="middle" className="text-xs font-bold">
        FORD
      </text>
    </svg>
  ),
  Volkswagen: () => (
    <svg viewBox="0 0 40 40" className="w-10 h-10 fill-white">
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M8 16 L20 16 L32 16 L28 28 L24 20 L20 28 L16 20 L12 28 Z"
        strokeWidth="1.5"
        stroke="white"
        fill="white"
      />
    </svg>
  ),
  Hyundai: () => (
    <svg viewBox="0 0 40 30" className="w-12 h-8 fill-white">
      <ellipse
        cx="20"
        cy="15"
        rx="18"
        ry="8"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <path d="M8 15 L32 15 M20 5 L20 25" stroke="white" strokeWidth="2" />
    </svg>
  ),
  Kia: () => (
    <svg viewBox="0 0 50 25" className="w-14 h-7 fill-white">
      <path
        d="M5 5 L5 20 M5 12 L15 5 M5 12 L15 20 M20 5 L20 20 M20 5 L30 20 M35 5 L35 20 M35 12 L45 5"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  ),
  Nissan: () => (
    <svg viewBox="0 0 50 30" className="w-14 h-8 fill-white">
      <rect
        x="5"
        y="8"
        width="40"
        height="14"
        rx="7"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <text x="25" y="18" textAnchor="middle" className="text-xs font-semibold">
        NISSAN
      </text>
    </svg>
  ),
  Chevrolet: () => (
    <svg viewBox="0 0 40 40" className="w-10 h-10 fill-white">
      <path d="M20 8 L8 16 L12 20 L20 16 L28 20 L32 16 L20 8 Z" />
      <path d="M20 32 L8 24 L12 20 L20 24 L28 20 L32 24 L20 32 Z" />
    </svg>
  ),
  Rivian: () => (
    <svg viewBox="0 0 50 20" className="w-16 h-6 fill-white">
      <path
        d="M5 5 L5 15 M5 5 L12 5 M5 10 L10 10 M15 5 L15 15 M15 5 L22 15 M25 5 L25 15 M30 5 L30 15 M30 10 L37 10 M40 5 L40 15 M40 5 L47 5"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  ),
  Lucid: () => (
    <svg viewBox="0 0 50 20" className="w-16 h-6 fill-white">
      <path
        d="M5 5 L5 15 M5 15 L12 15 M15 5 L15 15 M15 5 L15 12 L22 12 M25 5 L25 15 M25 10 L30 5 M25 10 L30 15 M35 5 L35 15 M35 10 L42 10 M45 5 C47 7 47 13 45 15"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const evBrands = [
  {
    name: "Tesla",
    logo: <BrandLogos.Tesla />,
    coverage: "100%",
  },
  {
    name: "BMW",
    logo: <BrandLogos.BMW />,
    coverage: "95%",
  },
  {
    name: "Mercedes",
    logo: <BrandLogos.Mercedes />,
    coverage: "92%",
  },
  {
    name: "Audi",
    logo: <BrandLogos.Audi />,
    coverage: "90%",
  },
  {
    name: "Ford",
    logo: <BrandLogos.Ford />,
    coverage: "88%",
  },
  {
    name: "Volkswagen",
    logo: <BrandLogos.Volkswagen />,
    coverage: "85%",
  },
  {
    name: "Hyundai",
    logo: <BrandLogos.Hyundai />,
    coverage: "82%",
  },
  {
    name: "Kia",
    logo: <BrandLogos.Kia />,
    coverage: "80%",
  },
  {
    name: "Nissan",
    logo: <BrandLogos.Nissan />,
    coverage: "78%",
  },
  {
    name: "Chevrolet",
    logo: <BrandLogos.Chevrolet />,
    coverage: "85%",
  },
  {
    name: "Rivian",
    logo: <BrandLogos.Rivian />,
    coverage: "90%",
  },
  {
    name: "Lucid",
    logo: <BrandLogos.Lucid />,
    coverage: "88%",
  },
];

const coverageAreas = [
  {
    title: "Battery Systems",
    description: "Complete battery protection and diagnostics",
    icon: Battery,
    gradient: "from-emerald-400 to-green-500",
  },
  {
    title: "Charging Infrastructure",
    description: "All charging port and cable coverage",
    icon: Zap,
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    title: "Electric Motors",
    description: "Drivetrain and motor system warranty",
    icon: Cog,
    gradient: "from-purple-400 to-indigo-500",
  },
  {
    title: "Software Systems",
    description: "Updates and system maintenance",
    icon: Smartphone,
    gradient: "from-pink-400 to-rose-500",
  },
];

export function WarrantyTypesSection() {
  return (
    <section className="py-24 relative">
      {/* Subtle section-specific accent only */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(59,130,246,0.06),transparent_70%)]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Enhanced Title Section */}
          <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-300 font-medium tracking-wider">
              TRUSTED PROTECTION
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-light mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
            Coverage You Can Trust
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Comprehensive warranty protection for all major EV brands and
            systems, backed by industry-leading expertise
          </p>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <span>Certified Technicians</span>
            </div>
          </div>
        </motion.div>

        {/* EV Brands Scrolling Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl font-light text-white mb-4">
              Supported Brands
            </h3>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
          </div>

          <ThreeDScrollTriggerContainer className="py-8">
            {/* First row - scrolling right */}
            <ThreeDScrollTriggerRow
              baseVelocity={2}
              direction={1}
              className="mb-8"
            >
              {evBrands.slice(0, 6).map((brand, index) => (
                <div
                  key={`${brand.name}-1-${index}`}
                  className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mx-4 min-w-[220px] text-center hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex justify-center items-center mb-4 h-14 relative z-10">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {brand.logo}
                    </div>
                  </div>
                  <h4 className="font-medium text-white mb-3 text-lg group-hover:text-blue-100 transition-colors">
                    {brand.name}
                  </h4>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-emerald-400 font-medium">
                      {brand.coverage} covered
                    </p>
                  </div>
                </div>
              ))}
            </ThreeDScrollTriggerRow>

            {/* Second row - scrolling left */}
            <ThreeDScrollTriggerRow baseVelocity={2} direction={-1}>
              {evBrands.slice(6).map((brand, index) => (
                <div
                  key={`${brand.name}-2-${index}`}
                  className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mx-4 min-w-[220px] text-center hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex justify-center items-center mb-4 h-14 relative z-10">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {brand.logo}
                    </div>
                  </div>
                  <h4 className="font-medium text-white mb-3 text-lg group-hover:text-blue-100 transition-colors">
                    {brand.name}
                  </h4>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-emerald-400 font-medium">
                      {brand.coverage} covered
                    </p>
                  </div>
                </div>
              ))}
            </ThreeDScrollTriggerRow>
          </ThreeDScrollTriggerContainer>
        </motion.div>

        {/* Coverage Areas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl font-light text-white mb-4">
              What We Cover
            </h3>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {coverageAreas.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
                whileHover={{ y: -8 }}
              >
                <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 text-center hover:border-emerald-400/30 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Floating particles effect */}
                  <div
                    className="absolute top-4 right-4 w-2 h-2 bg-emerald-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="absolute top-8 right-8 w-1 h-1 bg-blue-400/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"
                    style={{ animationDelay: "0.3s" }}
                  ></div>

                  {/* Icon with proper design */}
                  <div
                    className={`relative mb-6 mx-auto w-16 h-16 bg-gradient-to-br ${area.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  >
                    <area.icon
                      className="w-8 h-8 text-white"
                      strokeWidth={1.5}
                    />
                    <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <h4 className="font-medium text-white mb-4 text-xl group-hover:text-emerald-100 transition-colors">
                    {area.title}
                  </h4>
                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                    {area.description}
                  </p>

                  {/* Enhanced bottom accent line with gradient animation */}
                  <div className="absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 group-hover:w-full group-hover:left-0 transition-all duration-500 rounded-t-full"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center"
        >
          <div className="max-w-3xl mx-auto relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 rounded-3xl blur-xl opacity-60"></div>

            <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-12">
              <h3 className="text-3xl font-light text-white mb-6">
                Ready to Protect Your EV Investment?
              </h3>
              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                Join thousands of satisfied customers who trust us with their
                electric vehicle warranty needs.
              </p>

              {/* Stats row */}
              <div className="flex justify-center items-center gap-8 mb-8 text-sm">
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>50K+ Protected EVs</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>95% Claim Approval</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>24/7 Support</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Get Started Today</span>
                </button>
                <button className="group border border-gray-600 text-white font-medium py-4 px-8 rounded-xl hover:border-white hover:bg-white hover:text-black transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
