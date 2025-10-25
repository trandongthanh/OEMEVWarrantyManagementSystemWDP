"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Shield, User, Search } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.header
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 z-50 w-full"
    >
      {/* Enhanced Background with Gradient and Patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-800/95 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"></div>

      <nav className="container mx-auto px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-2 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-2xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white group-hover:from-blue-100 group-hover:via-white group-hover:to-blue-100 transition-all duration-300">
              EVWarranty
            </span>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#vehicles"
              className="text-gray-300 hover:text-blue-400 transition-colors duration-300 relative group"
            >
              <span>Vehicles</span>
              <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></div>
            </a>
            <a
              href="#coverage"
              className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 relative group"
            >
              <span>Coverage</span>
              <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-emerald-400 to-blue-400 group-hover:w-full transition-all duration-300"></div>
            </a>
            <a
              href="#claims"
              className="text-gray-300 hover:text-purple-400 transition-colors duration-300 relative group"
            >
              <span>Claims</span>
              <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></div>
            </a>
            <a
              href="#support"
              className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 relative group"
            >
              <span>Support</span>
              <div className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-400 to-blue-400 group-hover:w-full transition-all duration-300"></div>
            </a>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          </div>

          {/* Enhanced Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 py-4 border-t border-gray-700/30"
          >
            <div className="flex flex-col space-y-4">
              <a
                href="#vehicles"
                className="text-gray-300 hover:text-blue-400 transition-colors px-4 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <span>Vehicles</span>
              </a>
              <a
                href="#coverage"
                className="text-gray-300 hover:text-emerald-400 transition-colors px-4 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                <span>Coverage</span>
              </a>
              <a
                href="#claims"
                className="text-gray-300 hover:text-purple-400 transition-colors px-4 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                <span>Claims</span>
              </a>
              <a
                href="#support"
                className="text-gray-300 hover:text-indigo-400 transition-colors px-4 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                <span>Support</span>
              </a>
              <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-700/30">
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-full font-medium text-center hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
