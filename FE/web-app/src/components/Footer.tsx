"use client";

import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      {/* Subtle section-specific accent only */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(147,51,234,0.04),transparent_50%)]"></div>

      <div className="container mx-auto px-6 py-16 relative z-10 text-white">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Enhanced Company Info */}
          <div className="lg:col-span-1">
            <div className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="h-8 w-8 text-blue-400" />
                  <span className="text-2xl font-light bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    EVWarranty
                  </span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Leading provider of comprehensive electric vehicle warranty
                  solutions. Protecting your investment with innovative coverage
                  and exceptional service.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Services */}
          <div className="group relative bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm border border-gray-700/20 rounded-xl p-6 hover:border-blue-400/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-purple-500/3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-light mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
                Services
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2 group/link"
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                    <span>EV Warranty Plans</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center gap-2 group/link"
                  >
                    <div className="w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                    <span>Battery Protection</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 group/link"
                  >
                    <div className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                    <span>Roadside Assistance</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center gap-2 group/link"
                  >
                    <div className="w-1 h-1 bg-indigo-400 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                    <span>Claims Processing</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group/link"
                  >
                    <div className="w-1 h-1 bg-pink-400 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                    <span>Extended Coverage</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Enhanced Support */}
          <div className="group relative bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm border border-gray-700/20 rounded-xl p-6 hover:border-emerald-400/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/3 to-blue-500/3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-light mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white">
                Support
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center gap-2 group/link"
                  >
                    <div className="w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                    <span>Help Center</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2 group/link"
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                    <span>Track Repair</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 group/link"
                  >
                    <div className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                    <span>FAQ</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center gap-2 group/link"
                  >
                    <div className="w-1 h-1 bg-indigo-400 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                    <span>Contact Us</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Enhanced Contact */}
          <div className="group relative bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm border border-gray-700/20 rounded-xl p-6 hover:border-purple-400/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 to-pink-500/3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-light mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white">
                Contact
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 group/contact hover:text-blue-400 transition-colors">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 group-hover/contact:text-blue-400 transition-colors">
                    1-800-EV-WARRANTY
                  </span>
                </li>
                <li className="flex items-center gap-3 group/contact hover:text-emerald-400 transition-colors">
                  <Mail className="h-4 w-4 text-emerald-400" />
                  <span className="text-gray-300 group-hover/contact:text-emerald-400 transition-colors">
                    support@evwarranty.com
                  </span>
                </li>
                <li className="flex items-start gap-3 group/contact hover:text-purple-400 transition-colors">
                  <MapPin className="h-4 w-4 text-purple-400 mt-1" />
                  <span className="text-gray-300 group-hover/contact:text-purple-400 transition-colors">
                    123 Electric Avenue
                    <br />
                    Tech City, TC 12345
                  </span>
                </li>
              </ul>

              {/* Enhanced Newsletter */}
              <div className="mt-8 p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/20 backdrop-blur-sm">
                <h4 className="font-light mb-4 text-white flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  Stay Updated
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Get the latest EV warranty insights and updates
                </p>
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-gray-800/80 transition-all duration-300"
                  />
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300 font-medium">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="border-t border-gray-700/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} EVWarranty. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Cookie Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
