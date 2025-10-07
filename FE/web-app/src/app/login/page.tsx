"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

// Interactive Range Rover Model Component
function InteractiveCar() {
  const { scene } = useGLTF("/models/range_rover_-_midnight_blue.glb");
  const carRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentView, setCurrentView] = useState("default");
  const { camera } = useThree();

  // Smooth rotation animation on hover with futuristic floating effect
  useFrame((state) => {
    if (carRef.current) {
      // Continuous slow rotation for showcase
      carRef.current.rotation.y += 0.002;

      // Subtle floating animation
      carRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.05 - 0.5;

      // Enhanced movement on hover
      if (isHovered) {
        carRef.current.rotation.y +=
          Math.sin(state.clock.elapsedTime * 2) * 0.003;
        carRef.current.position.y +=
          Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      }
    }
  });

  // Cinematic camera transitions with better angles for Range Rover
  const handleCarClick = useCallback(() => {
    const views = {
      default: { position: [4, 1.5, 5], target: [0, 0.5, 0] },
      frontAngle: { position: [3.5, 1.2, 4], target: [0, 0.8, 0] },
      sideProfile: { position: [5, 1, 0], target: [0, 0.5, 0] },
      rearAngle: { position: [-4, 1.8, -3], target: [0, 0.5, 0] },
      topView: { position: [0, 4, 2], target: [0, 0, 0] },
    };

    const viewKeys = Object.keys(views);
    const currentIndex = viewKeys.indexOf(currentView);
    const nextView = viewKeys[(currentIndex + 1) % viewKeys.length];

    const targetView = views[nextView as keyof typeof views];

    // Smooth camera transition
    const startPos = camera.position.clone();
    const targetPos = new THREE.Vector3(...targetView.position);

    let progress = 0;
    const animate = () => {
      progress += 0.015;
      if (progress <= 1) {
        camera.position.lerpVectors(startPos, targetPos, progress);
        camera.lookAt(new THREE.Vector3(...targetView.target));
        requestAnimationFrame(animate);
      }
    };
    animate();

    setCurrentView(nextView);
  }, [camera, currentView]);

  return (
    <primitive
      ref={carRef}
      object={scene}
      position={[0, -0.05, 0]}
      scale={[0.02, 0.02, 0.02]}
      rotation={[0, Math.PI * 0.15, 0]}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onClick={handleCarClick}
    />
  );
}

// Enhanced 3D Scene Component with Futuristic Lighting
function CarScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [4, 1.5, 5], fov: 50 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <PerspectiveCamera makeDefault position={[4, 1.5, 5]} />

      {/* Enhanced Lighting setup for luxury feel */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        color="#ffffff"
      />

      {/* Blue accent lights for Range Rover */}
      <pointLight position={[-5, 3, 5]} intensity={0.8} color="#1e40af" />
      <pointLight position={[5, 2, -5]} intensity={0.6} color="#3b82f6" />
      <pointLight position={[0, -1, 3]} intensity={0.4} color="#60a5fa" />

      {/* Spotlight for dramatic effect */}
      <spotLight
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
        color="#93c5fd"
      />

      {/* Premium Environment */}
      <Environment preset="sunset" />

      {/* Interactive Range Rover */}
      <InteractiveCar />

      {/* Enhanced controls for better interaction */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
        rotateSpeed={0.4}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={Math.PI * 0.25}
        maxDistance={8}
        minDistance={3}
      />
    </Canvas>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);

    // Handle login logic here
    console.log("Login submitted:", formData);
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
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white/10 transition-all backdrop-blur-sm hover:border-white/20"
                    placeholder="your.email@example.com"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
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

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-r from-transparent via-black to-transparent text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium">Google</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                  <span className="font-medium">Twitter</span>
                </motion.button>
              </div>
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
