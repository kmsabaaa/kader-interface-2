"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { revalidatePath } from "next/cache";

export async function requestBooking(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized. Please log in." };

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { error: "User account not synced." };

    const projectId = formData.get("projectId") as string;
    // We named the hidden input "listingId", but it might hold a Service ID!
    const submittedId = formData.get("listingId") as string; 
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    if (!projectId || !submittedId || !startDateStr || !endDateStr) {
      return { error: "Please fill out all fields." };
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (startDate >= endDate) {
      return { error: "Drop-off date must be after the Pick-up date." };
    }

    // 1. SMART DETECTION: Is this a Camera/Location or a Human Service?
    const isListing = await db.listing.findUnique({ where: { id: submittedId } });
    const isService = await db.service.findUnique({ where: { id: submittedId } });

    if (!isListing && !isService) {
      return { error: "Resource not found in database." };
    }

    const listingId = isListing ? submittedId : null;
    const serviceId = isService ? submittedId : null;

    // 2. STRICT CHECK: Double order for their own project?
    const existingProjectRequest = await db.callSheetItem.findFirst({
      where: {
        projectId: projectId,
        ...(listingId ? { listingId } : {}), // Dynamically query the right column
        ...(serviceId ? { serviceId } : {}),
        status: { in: ["PENDING", "APPROVED"] } 
      }
    });

    if (existingProjectRequest) {
      return { error: "You already requested this resource for this project." };
    }

    // 3. ALGORITHMIC COLLISION CHECK: Is anyone else renting it on these days?
    const dateCollision = await db.callSheetItem.findFirst({
      where: {
        ...(listingId ? { listingId } : {}),
        ...(serviceId ? { serviceId } : {}),
        status: { in:["PENDING", "APPROVED"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate }
      }
    });

    if (dateCollision) {
      return { error: "Date Unavailable: This resource is already booked for those dates." };
    }

    // 4. Create the request
    await db.callSheetItem.create({
      data: {
        projectId,
        listingId,  // Will be null if it's a service
        serviceId,  // Will be null if it's a listing
        startDate,
        endDate,
        status: "PENDING",
      },
    });

    if (listingId) revalidatePath(`/listing/${listingId}`);
    revalidatePath("/dashboard");

    return { success: true };

  } catch (err: any) {
    return { error: "System error: Could not process request." };
  }
}