import { db } from "../../../lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Camera, MapPin, Users, ShieldCheck, ChevronRight, Star, Sun, Zap, VolumeX, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import BookingWidget from "./BookingWidget";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { userId } = await auth();
  
  // 1. Fetch the Gear OR Location, AND include the Tech Scout Profile if it exists
  const listing = await db.listing.findUnique({
    where: { id: resolvedParams.id },
    include: { locationProfile: true, user: { select: { id: true, clerkId: true } } }
  });

  // Verify listing exists
  if (!listing) return notFound();
  let projects: any[] =[];
  
  if (userId) {
    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (dbUser) {
      projects = await db.project.findMany({
        where: { userId: dbUser.id, status: "PLANNING" }, 
        orderBy: { createdAt: "desc" }
      });
    }
  }

  const Icon = listing.type === "EQUIPMENT" ? Camera : listing.type === "LOCATION" ? MapPin : Users;
  const profile = listing.locationProfile;

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-28 pb-24 cursor-none selection:bg-amber-500/30">
      <div className="max-w-300 mx-auto px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium mb-6">
          <Link href="/search" className="hover:text-amber-500 transition-colors cursor-none">Marketplace</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="capitalize">{listing.type.toLowerCase()}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-zinc-300">{listing.title}</span>
        </div>

        {/* Cinematic Hero Image */}
        <div className="w-full h-[50vh] md:h-[60vh] bg-zinc-900 rounded-3xl overflow-hidden mb-10 relative border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {listing.imageUrl && (
            <Image 
              src={listing.imageUrl} 
              alt={listing.title} 
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Icon className="w-4 h-4" /> {listing.type}
            </span>
            <span className="px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-md border border-amber-500/30 text-xs font-bold text-amber-400 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" /> Premium Verified
            </span>
            {listing.type === "LOCATION" && profile?.permitStatus === "Acquired" && (
              <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-md border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Permits Cleared
              </span>
            )}
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-12 relative">
          
          <div className="flex-1 space-y-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{listing.title}</h1>
              <p className="text-xl text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            <div className="h-px w-full bg-white/10"></div>

            {/* DYNAMIC SPECS RENDERER */}
            {listing.type === "EQUIPMENT" ? (
              // RENDER CAMERA / GEAR SPECS
              <div>
                <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                    <span className="text-zinc-500 text-sm font-bold block mb-1">Condition</span>
                    <span className="text-white font-medium">Mint / Like New</span>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                    <span className="text-zinc-500 text-sm font-bold block mb-1">Insurance Required</span>
                    <span className="text-white font-medium">Yes - Escrow Coverage</span>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                    <span className="text-zinc-500 text-sm font-bold block mb-1">Pickup Location</span>
                    <span className="text-white font-medium">Bahrain</span>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
                    <span className="text-zinc-500 text-sm font-bold block mb-1">Minimum Rental</span>
                    <span className="text-white font-medium">1 Day</span>
                  </div>
                </div>
              </div>
            ) : listing.type === "LOCATION" ? (
              // RENDER ADVANCED LOCATION TECH SCOUT REPORT
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-emerald-400">
                    <FileText className="w-6 h-6" /> Kader Tech Scout Report
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex mb-1 items-center gap-2"><MapPin className="w-3 h-3"/> Location Type</span>
                      <span className="text-white font-medium">{profile?.typeOfLocation || "Unspecified"}</span>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider block mb-1">Size & Capacity</span>
                      <span className="text-white font-medium">{profile?.sqftArea || "Unspecified"}</span>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                      <span className="text-amber-500/70 text-xs font-bold uppercase tracking-wider flex mb-1 items-center gap-2"><Sun className="w-3 h-3"/> Sun Direction</span>
                      <span className="text-amber-400 font-medium">{profile?.sunDirection || "Unspecified"}</span>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                      <span className="text-blue-500/70 text-xs font-bold uppercase tracking-wider flex mb-1 items-center gap-2"><Zap className="w-3 h-3"/> Power Supply</span>
                      <span className="text-blue-400 font-medium">{profile?.powerSupply || "Unspecified"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex mb-1 items-center gap-2"><VolumeX className="w-3 h-3"/> Sound & Lighting Conditions</span>
                    <p className="text-white font-medium mb-2"><span className="text-zinc-500 text-sm">Sound:</span> {profile?.soundConditions || "Unspecified"}</p>
                    <p className="text-white font-medium"><span className="text-zinc-500 text-sm">Light:</span> {profile?.lightingConditions || "Unspecified"}</p>
                  </div>
                  
                  {profile?.restrictions && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex gap-4">
                      <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                      <div>
                        <span className="text-red-500/70 text-xs font-bold uppercase tracking-wider block mb-1">Restrictions & Rules</span>
                        <p className="text-red-400 font-medium whitespace-pre-wrap">{profile.restrictions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            
            <div className="h-px w-full bg-white/10"></div>
            
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex gap-4">
              <ShieldCheck className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-500 mb-1">Kader Protection Guarantee</h4>
                <p className="text-zinc-400 text-sm">Payments are held securely in escrow. Funds are strictly released after a successful shoot or verified hand-off.</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-100 shrink-0">
            <BookingWidget 
              projects={projects} 
              listingId={listing.id} 
              pricePerDay={listing.pricePerDay} 
              userId={userId} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}