import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, ShieldCheck, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AddToProject from "./AddToProject";
import ReviewForm from "../../components/ReviewForm";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const user = await currentUser();

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
      // Check if user has completed a booking for this listing
      const completedBooking = await db.callSheetItem.findFirst({
        where: {
          listingId: id,
          project: { userId: dbUser.id },
          status: "COMPLETED",
        },
      });
      hasCompletedBooking = !!completedBooking;
      // Check if user already reviewed
      const existingReview = await db.review.findFirst({
        where: { listingId: id, authorId: dbUser.id },
      });
      hasReviewed = !!existingReview;
    }
  }

  const avgRating = listing.reviews.length > 0
    ? (listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <div className="max-w-7xl mx-auto md:px-12 py-8">
        
        {/* Back Nav */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 px-4 md:px-0">
          <ArrowLeft className="w-4 h-4" /> Back to Mission Control
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT: VISUALS */}
          <div className="lg:col-span-2 space-y-8 px-4 md:px-0">
            <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 group">
               {listing.imageUrl ? (
                 <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black text-4xl uppercase tracking-widest">No Signal</div>
               )}
               <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold uppercase tracking-widest text-white">
                 {listing.type}
               </div>
            </div>

            <div className="space-y-6">
               <div>
                 <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{listing.title}</h1>
                 <div className="flex items-center gap-4 text-zinc-400 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-white">
                        {avgRating ?? "New"}{listing.reviews.length > 0 ? ` (${listing.reviews.length})` : ""}
                      </span>
                    </div>
                    {listing.locationProfile && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{listing.locationProfile.address || "Bahrain"}</span>
                      </div>
                    )}
                 </div>
               </div>
               
               <div className="prose prose-invert prose-lg max-w-none">
                 <p className="text-zinc-400 leading-relaxed">{listing.description}</p>
               </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="border-t border-white/5 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                {userId && hasCompletedBooking && !hasReviewed && (
                  <ReviewForm listingId={id} label="Leave a Review" />
                )}
              </div>
              {listing.reviews.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
                  <Star className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-600 text-sm font-medium">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {listing.reviews.map(review => (
                    <div key={review.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                          {review.author.name?.[0] ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{review.author.name ?? "Anonymous"}</p>
                          <p className="text-[11px] text-zinc-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-zinc-400 leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ACTION CARD */}
          <div className="px-4 md:px-0">
             <div className="sticky top-8 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                <div className="flex items-end justify-between mb-8 pb-8 border-b border-white/5">
                   <div>
                     <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-1">Daily Rate</p>
                     <p className="text-4xl font-black text-white">{listing.pricePerDay} <span className="text-lg text-amber-500">BHD</span></p>
                   </div>
                   <div className="text-right">
                     <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-1">Provider</p>
                     <div className="flex items-center gap-2 justify-end">
                       <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">
                         {listing.user.name?.[0] || "K"}
                       </div>
                       <p className="text-sm font-bold text-white">{listing.user.name || "Kader Agent"}</p>
                     </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-200 text-sm font-bold mb-1">Kader Secure</p>
                      <p className="text-blue-500/60 text-xs leading-relaxed">Funds held in Escrow until you verify the condition of this item.</p>
                    </div>
                  </div>

                  {/* THE BRIDGE COMPONENT */}
                  <AddToProject 
                    listingId={listing.id} 
                    projects={userProjects} 
                    price={listing.pricePerDay} 
                  />
                  
                  <p className="text-center text-zinc-600 text-[10px] uppercase tracking-widest font-bold mt-4">
                    Transaction Fee: 10%
                  </p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
