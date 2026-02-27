import { db } from "../../../../lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ScoutReportForm from "./ScoutReportForm";

export default async function ScoutReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // 1. Secure the route - verify user is authenticated and is a PROVIDER or ADMIN
  const { userId } = await auth();
  if (!userId) redirect("/");
  
  const currentUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!currentUser || currentUser.role !== "PROVIDER") {
    return notFound(); // Only providers/scouts can access
  }

  // 2. Fetch the specific Location and its linked Tech Scout Profile
  const listing = await db.listing.findUnique({
    where: { id: resolvedParams.id },
    include: { locationProfile: true }
  });

  if (!listing || listing.type !== "LOCATION") return notFound();
  
  // Only allow the owner of the listing to access the scout form
  if (listing.userId !== currentUser.id) return notFound();

  // 3. The Server Action to save the scout report with validation
  async function saveScoutReport(formData: FormData) {
    "use server";
    
    try {
      // Validate listing ownership and type
      const refreshedListing = await db.listing.findUnique({
        where: { id: resolvedParams.id }
      });
      
      if (!refreshedListing || refreshedListing.type !== "LOCATION") {
        return { error: "Invalid location or unauthorized access" };
      }
      
      if (!currentUser || refreshedListing.userId !== currentUser.id) {
        return { error: "You can only edit your own location profiles" };
      }
      
      // Sanitize and validate inputs
      const address = (formData.get("address") as string)?.trim() || "";
      const typeOfLocation = (formData.get("typeOfLocation") as string)?.trim() || "";
      const sqftArea = (formData.get("sqftArea") as string)?.trim() || "";
      const sunDirection = (formData.get("sunDirection") as string)?.trim() || "";
      const powerSupply = (formData.get("powerSupply") as string)?.trim() || "";
      const soundConditions = (formData.get("soundConditions") as string)?.trim() || "";
      const lightingConditions = (formData.get("lightingConditions") as string)?.trim() || "";
      const parkingLink = (formData.get("parkingLink") as string)?.trim() || "";
      const permitStatus = (formData.get("permitStatus") as string)?.trim() || "Pending";
      const restrictions = (formData.get("restrictions") as string)?.trim() || "";
      
      // Validate field lengths
      if (address.length > 500) return { error: "Address must be under 500 characters" };
      if (typeOfLocation.length > 200) return { error: "Type must be under 200 characters" };
      if (restrictions.length > 3000) return { error: "Restrictions must be under 3000 characters" };
      
      // Validate permitStatus enum
      const validPermitStatuses = ["Not Required", "Pending", "Pending Assessment", "Acquired", "Acquired / Verified", "Requires Government Clearance"];
      if (!validPermitStatuses.includes(permitStatus)) {
        return { error: "Invalid permit status" };
      }
      
      await db.locationProfile.upsert({
        where: { listingId: resolvedParams.id },
        update: {
          address,
          typeOfLocation,
          sqftArea,
          sunDirection,
          powerSupply,
          soundConditions,
          lightingConditions,
          parkingLink,
          permitStatus,
          restrictions,
        },
        create: {
          listingId: resolvedParams.id,
          address,
          typeOfLocation,
          sqftArea,
          sunDirection,
          powerSupply,
          soundConditions,
          lightingConditions,
          parkingLink,
          permitStatus,
          restrictions,
        }
      });

      revalidatePath(`/admin/scout/${resolvedParams.id}`);
      revalidatePath(`/listing/${resolvedParams.id}`);
      
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save scout report";
      return { error: message };
    }
  }

  const profile = listing.locationProfile;

  return (
    <ScoutReportForm 
      listing={listing}
      profile={profile}
      saveAction={saveScoutReport}
    />
  );
}