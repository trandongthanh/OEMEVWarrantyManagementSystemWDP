"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  easeOut,
} from "framer-motion";
import { cn } from "../lib/utils";
import { animate } from "framer-motion";
import { Star } from "lucide-react";

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface ThreeDTestimonialRingProps {
  /** Array of testimonials to display in the ring */
  testimonials: Testimonial[];
  /** Container width in pixels (will be scaled) */
  width?: number;
  /** 3D perspective value */
  perspective?: number;
  /** Distance of cards from center (z-depth) */
  cardDistance?: number;
  /** Initial rotation of the ring */
  initialRotation?: number;
  /** Animation duration for entrance */
  animationDuration?: number;
  /** Stagger delay between cards */
  staggerDelay?: number;
  /** Hover opacity for non-hovered cards */
  hoverOpacity?: number;
  /** Custom container className */
  containerClassName?: string;
  /** Custom ring className */
  ringClassName?: string;
  /** Custom card className */
  cardClassName?: string;
  /** Background color of the stage */
  backgroundColor?: string;
  /** Enable/disable drag functionality */
  draggable?: boolean;
  /** Breakpoint for mobile responsiveness */
  mobileBreakpoint?: number;
  /** Scale factor for mobile */
  mobileScaleFactor?: number;
  /** Power for the drag end inertia animation */
  inertiaPower?: number;
  /** Time constant for the drag end inertia animation */
  inertiaTimeConstant?: number;
  /** Multiplier for initial velocity when drag ends */
  inertiaVelocityMultiplier?: number;
}

export function ThreeDTestimonialRing({
  testimonials,
  width = 400,
  perspective = 2000,
  cardDistance = 500,
  initialRotation = 180,
  animationDuration = 1.5,
  staggerDelay = 0.1,
  hoverOpacity = 0.5,
  containerClassName,
  ringClassName,
  cardClassName,
  backgroundColor,
  draggable = true,
  mobileBreakpoint = 768,
  mobileScaleFactor = 0.8,
  inertiaPower = 0.8,
  inertiaTimeConstant = 300,
  inertiaVelocityMultiplier = 20,
}: ThreeDTestimonialRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const rotationY = useMotionValue(initialRotation);
  const startX = useRef<number>(0);
  const currentRotationY = useRef<number>(initialRotation);
  const isDragging = useRef<boolean>(false);
  const velocity = useRef<number>(0);

  const [currentScale, setCurrentScale] = useState(1);
  const [showCards, setShowCards] = useState(false);

  const angle = useMemo(() => 360 / testimonials.length, [testimonials.length]);

  useEffect(() => {
    const unsubscribe = rotationY.on("change", (latestRotation) => {
      currentRotationY.current = latestRotation;
    });
    return () => unsubscribe();
  }, [rotationY]);

  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const newScale =
        viewportWidth <= mobileBreakpoint ? mobileScaleFactor : 1;
      setCurrentScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [mobileBreakpoint, mobileScaleFactor]);

  useEffect(() => {
    setShowCards(true);
  }, []);

  const handleDragStart = (event: React.MouseEvent | React.TouchEvent) => {
    if (!draggable) return;
    isDragging.current = true;
    const clientX =
      "touches" in event ? event.touches[0].clientX : event.clientX;
    startX.current = clientX;
    rotationY.stop();
    velocity.current = 0;
    if (ringRef.current) {
      (ringRef.current as HTMLElement).style.cursor = "grabbing";
    }
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDrag);
    document.addEventListener("touchend", handleDragEnd);
  };

  const handleDrag = (event: MouseEvent | TouchEvent) => {
    if (!draggable || !isDragging.current) return;

    const clientX =
      "touches" in event
        ? (event as TouchEvent).touches[0].clientX
        : (event as MouseEvent).clientX;
    const deltaX = clientX - startX.current;

    velocity.current = -deltaX * 0.5;
    rotationY.set(currentRotationY.current + velocity.current);
    startX.current = clientX;
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    if (ringRef.current) {
      ringRef.current.style.cursor = "grab";
      currentRotationY.current = rotationY.get();
    }

    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDrag);
    document.removeEventListener("touchend", handleDragEnd);

    const initial = rotationY.get();
    const velocityBoost = velocity.current * inertiaVelocityMultiplier;
    const target = initial + velocityBoost;

    animate(initial, target, {
      type: "inertia",
      velocity: velocityBoost,
      power: inertiaPower,
      timeConstant: inertiaTimeConstant,
      restDelta: 0.5,
      modifyTarget: (target) => Math.round(target / angle) * angle,
      onUpdate: (latest) => {
        rotationY.set(latest);
      },
    });

    velocity.current = 0;
  };

  const cardVariants = {
    hidden: { y: 200, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full overflow-hidden select-none relative",
        containerClassName
      )}
      style={{
        backgroundColor,
        transform: `scale(${currentScale})`,
        transformOrigin: "center center",
      }}
      onMouseDown={draggable ? handleDragStart : undefined}
      onTouchStart={draggable ? handleDragStart : undefined}
    >
      <div
        style={{
          perspective: `${perspective}px`,
          width: `${width}px`,
          height: `${width * 1.33}px`,
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          ref={ringRef}
          className={cn("w-full h-full absolute", ringClassName)}
          style={{
            transformStyle: "preserve-3d",
            rotateY: rotationY,
            cursor: draggable ? "grab" : "default",
          }}
        >
          <AnimatePresence>
            {showCards &&
              testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    "absolute rounded-lg border-2 border-white/20 bg-gray-900 shadow-lg shadow-white/10",
                    cardClassName
                  )}
                  style={{
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    rotateY: index * -angle,
                    z: -cardDistance * currentScale,
                    transformOrigin: `50% 50% ${cardDistance * currentScale}px`,
                    width: "300px",
                    height: "400px",
                    left: "50%",
                    top: "50%",
                    marginLeft: "-150px",
                    marginTop: "-200px",
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={cardVariants}
                  transition={{
                    delay: index * staggerDelay,
                    duration: animationDuration,
                    ease: easeOut,
                  }}
                  whileHover={{ opacity: 1, transition: { duration: 0.15 } }}
                  onHoverStart={() => {
                    if (isDragging.current) return;
                    if (ringRef.current) {
                      Array.from(ringRef.current.children).forEach(
                        (cardEl, i) => {
                          if (i !== index) {
                            (
                              cardEl as HTMLElement
                            ).style.opacity = `${hoverOpacity}`;
                          }
                        }
                      );
                    }
                  }}
                  onHoverEnd={() => {
                    if (isDragging.current) return;
                    if (ringRef.current) {
                      Array.from(ringRef.current.children).forEach((cardEl) => {
                        (cardEl as HTMLElement).style.opacity = `1`;
                      });
                    }
                  }}
                >
                  <div className="p-6 text-white h-full flex flex-col">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-white fill-current"
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <div className="flex-grow mb-6">
                      <p className="text-gray-300 leading-relaxed text-sm">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-700">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-light text-white text-sm">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default ThreeDTestimonialRing;
