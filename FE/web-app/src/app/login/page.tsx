"use client";

import { useState } from "react";
import nextDynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// Dynamically import the 3D CarScene component to avoid SSR issues
const CarScene = nextDynamic(() => import("@/components/login/CarScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
    </div>
  ),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, isLoading } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate inputs
    if (!formData.username || !formData.password) {
      setLocalError("Please enter both username and password");
      return;
    }

    try {
      await login(formData.username, formData.password);
      // Navigation is handled by the useAuth hook
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="auth-page min-h-screen bg-black flex overflow-hidden relative">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 ml-12">
        {/* Enhanced Animated Background Elements for Form Side */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${
                  i === 0 ? "#3b82f6" : i === 1 ? "#2563eb" : "#1d4ed8"
                }, transparent)`,
                left: `${10 + i * 25}%`,
                top: `${5 + i * 35}%`,
                filter: "blur(40px)",
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.08, 0.15, 0.08],
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 5 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md relative z-20"
        >
          <div className="mesh-glass rounded-3xl p-10 shadow-2xl border border-white/10 backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  EVWarranty
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-gray-400 text-lg">
                Access your premium EV warranty portal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {localError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{localError}</p>
                </motion.div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  Username
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white/10 transition-all backdrop-blur-sm hover:border-white/20"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-blue-400" />
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-14 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white/10 transition-all backdrop-blur-sm hover:border-white/20"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-start pt-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)",
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span className="relative z-10 text-lg">Sign In</span>
                )}
              </motion.button>
            </form>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Secure access to your warranty management system
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - 3D Range Rover Model */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
        {/* Enhanced 3D Model Background */}
        <div className="absolute inset-0 bg-gradient-to-l from-blue-950/30 via-blue-900/10 to-transparent"></div>

        {/* Futuristic Grid Effect */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* Interaction Instructions */}
        <div className="absolute top-8 right-8 z-20 text-right">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-blue-500/20 shadow-xl">
            <p className="text-blue-300 font-medium mb-1">
              Interactive 3D Model
            </p>
            <p className="text-white/60 text-sm">Hover • Click • Drag</p>
            <p className="text-white/40 text-xs mt-2">
              Range Rover Midnight Blue
            </p>
          </div>
        </div>

        {/* 3D Scene Container */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full h-full relative"
        >
          <CarScene />
        </motion.div>
      </div>
    </div>
  );
}
