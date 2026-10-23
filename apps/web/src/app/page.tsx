import Link from "next/link";
import { LandingHero } from "@/components/LandingHero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-lg">F</span>
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
              FarmerReach<span className="text-primary">NG</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
            <a href="#impact" className="hover:text-primary transition-colors">Impact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-secondary transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero with GSAP */}
      <LandingHero />

      {/* Features */}
      <section id="features" className="py-24 bg-muted/40 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
              Built for the full value chain
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From irrigation advisory to storage booking and market discovery — one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Targeted Advisory",
                desc: "Extension officers send SMS & WhatsApp campaigns filtered by LGA, crop, and irrigation status.",
                icon: "📡",
              },
              {
                title: "Post-Harvest Storage",
                desc: "Book ambient, cold, silo or warehouse space by the kilogram. Transparent daily rates.",
                icon: "🏚️",
              },
              {
                title: "Market Access",
                desc: "Farmers list produce. Buyers and aggregators discover available harvests by location and crop.",
                icon: "🛒",
              },
              {
                title: "Role-Based Access",
                desc: "Farmers, Officers, Storage Operators, Admins & Super Admins — each with the right tools.",
                icon: "🔐",
              },
              {
                title: "Live Analytics",
                desc: "Dashboard showing farmers reached, messages delivered, storage utilization and more.",
                icon: "📊",
              },
              {
                title: "Dry-Season Focus",
                desc: "Designed around irrigation farming realities in Plateau State during the dry months.",
                icon: "💧",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl bg-card border border-border p-8 hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
            Ready to connect Plateau&apos;s farmers?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Join the platform built for extension excellence and farmer resilience.
          </p>
          <Link
            href="/register"
            className="mt-10 inline-flex items-center justify-center h-14 px-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:bg-secondary transition-all"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">F</span>
            </div>
            <span className="font-bold">FarmerReachNG</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Plateau State • Agritech for dry-season resilience
          </p>
        </div>
      </footer>
    </div>
  );
}
