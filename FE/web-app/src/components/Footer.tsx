"use client";

import { Shield, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      {/* Subtle section-specific accent only */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(147,51,234,0.04),transparent_50%)]"></div>

      <div className="container mx-auto px-6 py-16 relative z-10 text-white">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
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
              </div>
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
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="border-t border-gray-700/30 pt-8">
          <div className="text-center text-gray-400 text-sm">
            © {currentYear} EVWarranty. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
