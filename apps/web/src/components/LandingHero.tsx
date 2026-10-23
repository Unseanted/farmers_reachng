"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function LandingHero() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-badge", { y: 24, opacity: 0, duration: 0.55 })
        .from(".hero-title", { y: 48, opacity: 0, duration: 0.75 }, "-=0.25")
        .from(".hero-subtitle", { y: 32, opacity: 0, duration: 0.65 }, "-=0.35")
        .from(".hero-cta", { y: 24, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.3")
        .from(".hero-stat", { y: 28, opacity: 0, duration: 0.45, stagger: 0.08 }, "-=0.2");
    },
    { scope: container }
  );

  return (
    <section ref={container} className="relative overflow-hidden flex-1">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36">
        <div className="max-w-3xl">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Plateau State • Dry Season Farming
          </div>
          <h1 className="hero-title font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            Reach every farmer.{" "}
            <span className="text-primary">Protect every harvest.</span>
          </h1>
          <p className="hero-subtitle mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            The platform that lets agricultural extension officers deliver timely
            advice via SMS &amp; WhatsApp, while giving farmers market access and
            affordable post-harvest storage across Plateau State.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="hero-cta inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:bg-secondary transition-all hover:scale-[1.02]"
            >
              Join as Extension Officer
            </Link>
            <Link
              href="/register?role=farmer"
              className="hero-cta inline-flex items-center justify-center h-14 px-8 rounded-full border-2 border-border bg-card text-foreground font-bold text-base hover:border-primary hover:text-primary transition-all"
            >
              I am a Farmer
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
          {[
            { label: "LGAs Covered", value: "17" },
            { label: "Message Channels", value: "SMS + WA" },
            { label: "Storage Types", value: "4" },
            { label: "Roles Supported", value: "5" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="hero-stat rounded-2xl bg-card border border-border p-5 shadow-sm"
            >
              <div className="font-display text-3xl font-extrabold text-primary">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
