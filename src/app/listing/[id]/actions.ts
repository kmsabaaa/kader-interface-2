"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { revalidatePath } from "next/cache";

export async function requestBooking(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const listingId = formData.get("listingId") as string;
  const projectId = formData.get("projectId") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!startDateStr || !endDateStr || !projectId) {
    return { error: "Missing required booking details." };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Math check: ensure dates are valid
  if (endDate < startDate) {
    return { error: "Drop-off date cannot be before Pick-up date." };
  }

  try {
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { pricePerDay: true }
    });

    if (!listing) return { error: "Listing not found." };

    // Check for date conflicts on this listing
    const conflict = await db.callSheetItem.findFirst({
      where: {
        listingId,
        status: { in: ["REQUESTED", "ACCEPTED", "ESCROW_FUNDED"] },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });
    if (conflict) {
      return { error: "These dates are already booked for this item. Please choose different dates." };
    }

    // Calculate total cost
    const diff = endDate.getTime() - startDate.getTime();
    let days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days <= 0) days = 1;
    
    const subtotal = listing.pricePerDay * days;
    const fee = subtotal * 0.1;
    const totalCost = subtotal + fee;

    // Create the booking item in the pipeline
    await db.callSheetItem.create({
      data: {
        projectId,
        listingId,
        startDate,
        endDate,
        totalCost,
        status: "REQUESTED", // Starting point of our new pipeline
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/project/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Booking Error:", error);
    return { error: "A server error occurred while processing your request." };
  }
}
