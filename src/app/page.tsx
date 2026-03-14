"use client";

import Link from "next/link";
import { Package2, ArrowRight, Boxes, TrendingUp, ShieldCheck, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] font-sans relative overflow-hidden flex flex-col">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-green-400/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-300/20 blur-[120px]"></div>
      </div>

      {/* Sticky Glassmorphism Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-green-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
          
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Package2 className="h-6 w-6" />
            </div>
            <span className="text-xl font-extrabold text-green-950 tracking-tight">
              CoreInventory
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-green-900 hover:text-green-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-semibold bg-green-950 text-white rounded-full shadow-lg shadow-green-900/20 hover:bg-green-800 hover:shadow-green-900/30 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center z-10">
        
        {/* SaaS Pill Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/50 border border-green-200 text-green-800 text-sm font-medium backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          CoreInventory 2.0 is live for Hackathon
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-green-950 tracking-tight max-w-4xl mb-6 leading-[1.1]">
          Smart Inventory for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
            Modern Businesses.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-green-900/70 max-w-2xl mb-10 font-medium leading-relaxed">
          Stop guessing and start tracking. CoreInventory provides real-time visibility, automated alerts, and seamless warehouse management in one beautiful dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-full font-bold text-lg shadow-xl shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/40 hover:-translate-y-0.5 transition-all"
          >
            Start For Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-white border border-green-200 text-green-900 rounded-full font-bold text-lg hover:bg-green-50 hover:border-green-300 transition-all"
          >
            View Demo
          </Link>
        </div>
      </main>

      {/* Features Section (Bento Grid Style) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24 z-10 w-full">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-green-950 mb-4">Everything you need to scale</h2>
          <p className="text-green-800/60 font-medium">Built for speed, accuracy, and total control.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="group bg-white p-8 rounded-3xl border border-green-100 shadow-sm hover:shadow-xl hover:shadow-green-900/5 hover:-translate-y-1 transition-all duration-300">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <Boxes className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-green-950 mb-3">
              Product Management
            </h3>
            <p className="text-green-900/60 leading-relaxed">
              Easily create, categorize, and manage your entire product catalog with custom SKU generation and variant tracking.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white p-8 rounded-3xl border border-green-100 shadow-sm hover:shadow-xl hover:shadow-green-900/5 hover:-translate-y-1 transition-all duration-300">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <TrendingUp className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-green-950 mb-3">
              Real-time Tracking
            </h3>
            <p className="text-green-900/60 leading-relaxed">
              Monitor stock levels as they happen. Get instant notifications for low stock, incoming shipments, and outgoing orders.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white p-8 rounded-3xl border border-green-100 shadow-sm hover:shadow-xl hover:shadow-green-900/5 hover:-translate-y-1 transition-all duration-300">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-green-950 mb-3">
              Smart Dashboards
            </h3>
            <p className="text-green-900/60 leading-relaxed">
              Visualize your data. Generate instant reports and actionable insights to optimize your supply chain and reduce costs.
            </p>
          </div>

        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-green-100 bg-white py-8 text-center text-sm font-medium text-green-900/40">
        <p>© {new Date().getFullYear()} CoreInventory. Built for the Hackathon.</p>
      </footer>

    </div>
  );
}