"use client";

import { Suspense, lazy, useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Application } from "@splinetool/runtime";
const Spline = lazy(() => import("@splinetool/react-spline"));

// ============================================================================
// SPOTLIGHT COMPONENT
// ============================================================================
type SpotlightProps = {
  className?: string;
  fill?: string;
};

function Spotlight({ className, fill }: SpotlightProps) {
  return (
    <svg
      className={`animate-spotlight pointer-events-none absolute z-1 h-[169%] w-[138%] lg:w-[84%] opacity-0 ${
        className || ""
      }`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill || "white"}
          fillOpacity="0.21"
        ></ellipse>
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          ></feBlend>
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_1065_8"
          ></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  );
}

// ============================================================================
// SPLINE SCENE COMPONENT
// ============================================================================
interface SplineSceneProps {
  scene: string;
  className?: string;
  followCursor?: boolean;
}

function SplineScene({
  scene,
  className,
  followCursor = false,
}: SplineSceneProps) {
  const splineRef = useRef<Application | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });

  // Handle mouse movement
  useEffect(() => {
    if (!followCursor || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Convert to rotation angles (-1 to 1 range, then scale)
      const rotationY = (x - 0.5) * 0.8; // Left-right rotation
      const rotationX = (y - 0.5) * 0.5; // Up-down rotation (natural)

      // Clamp to avoid extreme rotations
      const rotX = Math.max(-0.4, Math.min(0.4, rotationX));
      const rotY = Math.max(-0.9, Math.min(0.9, rotationY));

      setTargetRotation({ x: rotX, y: rotY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [followCursor]);

  // Apply rotation to robot
  useEffect(() => {
    if (!followCursor || !splineRef.current) return;

    const animate = () => {
      if (!splineRef.current) return;

      try {
        // Try to find and rotate the robot's head or main object
        // Common object names in Spline: 'Robot', 'Head', 'Character', etc.
        const possibleNames = [
          "Robot",
          "Head",
          "Character",
          "Body",
          "Model",
          "Scene",
        ];

        for (const name of possibleNames) {
          const obj = splineRef.current.findObjectByName(name);
          if (obj) {
            // Smooth interpolation
            const smoothing = 0.1;
            obj.rotation.x += (targetRotation.x - obj.rotation.x) * smoothing;
            obj.rotation.y += (targetRotation.y - obj.rotation.y) * smoothing;
            break;
          }
        }
      } catch (error) {
        console.debug("Spline object manipulation:", error);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [followCursor, targetRotation]);

  function onLoad(splineApp: Application) {
    splineRef.current = splineApp;

    // Log available objects for debugging
    if (followCursor) {
      console.log(
        "Spline scene loaded. Available objects:",
        splineApp.getAllObjects?.()?.map((obj: { name: string }) => obj.name) ||
          "getAllObjects not available"
      );
    }
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse">
              Loading 3D scene...
            </span>
          </div>
        }
      >
        <Spline scene={scene} className={className} onLoad={onLoad} />
      </Suspense>
    </div>
  );
}

// ============================================================================
// MAIN ROBOT UI COMPONENT (COMPLETE DEMO)
// ============================================================================
export function RobotUIComplete() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Main gradient background - dark red to black */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2d0a0f] via-[#1a0508] to-black pointer-events-none" />

      {/* Animated spotlight effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#EB0A1E"
      />

      {/* Additional red glow overlay for depth */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-racing-red/20 via-racing-red/5 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-5" />

      {/* 3D Scene - Full screen background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full pointer-events-none"
          followCursor={true}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12">
        {/* Top branding */}
        <div className="space-y-2">
          <div className="inline-block">
            <div className="flex items-center">
              <Image
                src="/toyota_logo.png"
                alt="Toyota Gazoo Racing Logo"
                width={200}
                height={80}
                className="drop-shadow-[0_0_20px_rgba(235,10,30,0.5)]"
              />
            </div>
          </div>
          <div className="h-1 w-32 bg-primary shadow-[0_0_10px_rgba(235,10,30,0.8)]" />
        </div>

        {/* Bottom content */}
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-primary shadow-[0_0_10px_rgba(235,10,30,0.8)]" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Raikou
              </h2>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed pl-4 italic">
              &ldquo;Greetings, I&apos;m{" "}
              <span className="text-foreground font-semibold">Raikou</span> —
              the intelligent core of Toyota Gazoo Racing. I fuse data, insight,
              and innovation to keep you one lap ahead.&rdquo;
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pl-4">
            <Link href="/chat">
              <button className="group relative px-10 py-4 bg-primary rounded-md transition-all duration-300 hover:bg-[#c40818] hover:scale-105 active:scale-100 hover:shadow-[0_0_30px_rgba(235,10,30,0.8)] flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-white font-bold text-lg uppercase tracking-wide">
                  Chat
                </span>
              </button>
            </Link>
            <Link href="/explain">
              <button className="group relative px-10 py-4 bg-primary rounded-md transition-all duration-300 hover:bg-[#c40818] hover:scale-105 active:scale-100 hover:shadow-[0_0_30px_rgba(235,10,30,0.8)] flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span className="text-white font-bold text-lg uppercase tracking-wide">
                  Explain
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Racing line accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(235,10,30,0.8)] z-15" />
    </div>
  );
}
