import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Star, ArrowLeft, ShieldCheck, Camera, MapPinIcon, Zap } from "lucide-react";
import Link from "next/link";
import BookingWidget from "./BookingWidget";
import ReviewForm from "../../components/ReviewForm";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();

  const listing = await db.listing.findUnique({
    where: { id },
    include: { 
      user: true, 
      locationProfile: true,
      bookings: true,
      reviews: { include: { author: { select: { name: true, profileImage: true } } }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!listing) notFound();

  // Fetch User's Projects for the Dropdown
  let userProjects: { id: string; title: string; status: string }[] = [];
  let hasCompletedBooking = false;
  let hasReviewed = false;

  if (userId) {
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      include: { projects: { where: { status: { not: "ARCHIVED" } } } }
    });
    if (dbUser) {
      userProjects = dbUser.projects;
      const completedBooking = await db.callSheetItem.findFirst({
        where: {
          listingId: id,
          project: { userId: dbUser.id },
          status: "COMPLETED",
        },
      });
      hasCompletedBooking = !!completedBooking;
      const existingReview = await db.review.findFirst({
        where: { listingId: id, authorId: dbUser.id },
      });
      hasReviewed = !!existingReview;
    }
  }

  const avgRating = listing.reviews.length > 0
    ? (listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null;

  const isLocation = listing.type === "LOCATION";
  const accentColor = isLocation ? "emerald" : "amber";

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* AMBIENT GLOW */}
      <div className={`fixed top-0 ${isLocation ? "right-0" : "left-0"} w-[40vw] h-[40vw] rounded-full ${isLocation ? "bg-emerald-600/5" : "bg-amber-600/5"} blur-[150px] pointer-events-none z-0`} />

      <div className="relative z-10">
        {/* HERO IMAGE — full bleed */}
        <div className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden">
          {listing.imageUrl ? (
            <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">
              {isLocation ? <MapPinIcon className="w-24 h-24" /> : <Camera className="w-24 h-24" />}
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent" />
          
          {/* Back button */}
          <Link
            href={isLocation ? "/locations" : "/equipment"}
            className="absolute top-28 left-6 md:left-10 flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 transition-all hover:bg-black/70"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          {/* Type badge */}
          <div className="absolute top-28 right-6 md:right-10">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest backdrop-blur-md border ${
              isLocation
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}>
              {listing.type}
            </span>
          </div>

          {/* Title overlay at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-10">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-3 text-white drop-shadow-2xl">
                {listing.title}
              </h1>
              <div className="flex items-center gap-5 flex-wrap text-sm font-medium">
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <Star className={`w-4 h-4 ${avgRating ? "fill-amber-400 text-amber-400" : "text-zinc-600"}`} />
                  <span className="font-bold">{avgRating ?? "New"}</span>
                  {listing.reviews.length > 0 && <span className="text-zinc-400">({listing.reviews.length})</span>}
                </div>
                {listing.locationProfile?.address && (
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{listing.locationProfile.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Kader Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* LEFT: DESCRIPTION + LOCATION DETAILS + REVIEWS */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Description */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className={`w-5 h-5 ${isLocation ? "text-emerald-400" : "text-amber-400"}`} />
                  About This {isLocation ? "Location" : "Equipment"}
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed font-light">
                  {listing.description || "Professional-grade resource available for your next production."}
                </p>
              </div>

              {/* Location Profile specs */}
              {listing.locationProfile && (
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    Location Specs
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listing.locationProfile.sqftArea && (
                      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Area</p>
                        <p className="font-bold text-white">{listing.locationProfile.sqftArea} sqft</p>
                      </div>
                    )}
                    {listing.locationProfile.typeOfLocation && (
                      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Type</p>
                        <p className="font-bold text-white capitalize">{listing.locationProfile.typeOfLocation}</p>
                      </div>
                    )}
                    {listing.locationProfile.sunDirection && (
                      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Sun Direction</p>
                        <p className="font-bold text-white">{listing.locationProfile.sunDirection}</p>
                      </div>
                    )}
                    {listing.locationProfile.powerSupply && (
                      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Power Supply</p>
                        <p className="font-bold text-white">{listing.locationProfile.powerSupply}</p>
                      </div>
                    )}
                    {listing.locationProfile.soundConditions && (
                      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Sound</p>
                        <p className="font-bold text-white">{listing.locationProfile.soundConditions}</p>
                      </div>
                    )}
                    {listing.locationProfile.permitStatus && (
                      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Permit</p>
                        <p className={`font-bold ${listing.locationProfile.permitStatus.toLowerCase().includes("approved") ? "text-emerald-400" : "text-amber-400"}`}>
                          {listing.locationProfile.permitStatus}
                        </p>
                      </div>
                    )}
                  </div>
                  {listing.locationProfile.restrictions && (
                    <div className="mt-4 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Restrictions</p>
                      <p className="text-zinc-400 text-sm leading-relaxed">{listing.locationProfile.restrictions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Provider */}
              <div>
                <h2 className="text-xl font-bold mb-5">Listed By</h2>
                <Link href={listing.user.isCreator ? `/creator/${listing.user.id}` : "#"} className="group flex items-center gap-4 bg-zinc-900/60 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all w-fit">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg shrink-0">
                    {listing.user.name?.[0] || "K"}
                  </div>
                  <div>
                    <p className="font-bold text-white group-hover:text-amber-400 transition-colors">{listing.user.name || "Kader Verified Provider"}</p>
                    <p className="text-zinc-500 text-xs font-medium">{listing.user.isCreator ? "Verified Creator" : "Verified Provider"}</p>
                  </div>
                </Link>
              </div>

              {/* REVIEWS */}
              <div className="border-t border-white/5 pt-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Reviews
                    {listing.reviews.length > 0 && (
                      <span className="text-zinc-500 text-base font-normal">{avgRating} avg</span>
                    )}
                  </h2>
                  {userId && hasCompletedBooking && !hasReviewed && (
                    <ReviewForm listingId={id} label="Write a Review" />
                  )}
                </div>
                {listing.reviews.length === 0 ? (
                  <div className="py-14 text-center border border-dashed border-white/10 rounded-3xl">
                    <Star className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-600 text-sm font-medium">No reviews yet. Be the first after your booking!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listing.reviews.map(review => (
                      <div key={review.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                              {review.author.name?.[0] ?? "?"}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{review.author.name ?? "Anonymous"}</p>
                              <p className="text-[11px] text-zinc-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-zinc-400 leading-relaxed text-sm italic">&quot;{review.comment}&quot;</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: BOOKING WIDGET */}
            <div>
              <BookingWidget
                listingId={listing.id}
                projects={userProjects}
                pricePerDay={listing.pricePerDay}
                userId={userId}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
