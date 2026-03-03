"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../lib/db";
import { revalidatePath } from "next/cache";
import { ListingType } from "@prisma/client";

export async function updateCreatorProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const data = {
    creatorTitle: formData.get("creatorTitle") as string,
    creatorBio: formData.get("creatorBio") as string,
    showreelUrl: formData.get("showreelUrl") as string,
    location: formData.get("location") as string,
    instagram: formData.get("instagram") as string,
    linkedin: formData.get("linkedin") as string,
    website: formData.get("website") as string,
    isCreator: true,
    role: "PROVIDER", // Automatically upgrade to provider
  };

  await db.user.update({
    where: { clerkId: userId },
    data,
  });

  revalidatePath("/dashboard");
  revalidatePath("/talent");
}

export async function createListing(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) throw new Error("User not found");

  await db.listing.create({
    data: {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      pricePerDay: parseFloat(formData.get("pricePerDay") as string),
      type: formData.get("type") as ListingType,
      imageUrl: formData.get("imageUrl") as string,
      userId: dbUser.id,
      visibility: "PUBLISHED",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/search");
}

export async function toggleUserRole() {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return { error: "User not found" };

  const newRole = dbUser.role === "PROVIDER" ? "CONSUMER" : "PROVIDER";

  await db.user.update({
    where: { clerkId: userId },
    data: { role: newRole }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function createNewProject(prevState: any, formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Log in to initiate production." };

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { error: "Account mismatch. Try logging in again." };

    const title = formData.get("title") as string;
    const budget = parseFloat(formData.get("budget") as string);

    if (!title || isNaN(budget)) return { error: "Missing title or valid budget." };

    await db.project.create({
      data: {
        title,
        budget,
        userId: dbUser.id,
        status: "PLANNING"
      }
    });

    revalidatePath("/dashboard");
    return { success: true };

  } catch (err: any) {
    return { error: "System crash: Could not create project." };
  }
}

export async function createNewListing(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) throw new Error("User not found");

  await db.listing.create({
    data: {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      pricePerDay: parseFloat(formData.get("pricePerDay") as string),
      type: formData.get("type") as ListingType,
      imageUrl: formData.get("imageUrl") as string,
      userId: dbUser.id,
      visibility: "PUBLISHED"
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/search");
}

export async function createNewService(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) throw new Error("User not found");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const pricePerDay = parseFloat(formData.get("pricePerDay") as string);

  if (!title || !description || isNaN(pricePerDay) || pricePerDay < 0) {
    throw new Error("Invalid service data. Please fill in all required fields.");
  }

  await db.service.create({
    data: {
      title,
      description,
      pricePerDay,
      userId: dbUser.id,
    }
  });

  revalidatePath("/dashboard");
}

export async function deleteListing(listingId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) throw new Error("User not found");

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");
  if (listing.userId !== dbUser.id) throw new Error("You do not own this listing");

  await db.listing.delete({ where: { id: listingId } });

  revalidatePath("/dashboard");
  revalidatePath("/search");
}

export async function updateListing(listingId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) throw new Error("User not found");

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");
  if (listing.userId !== dbUser.id) throw new Error("You do not own this listing");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const pricePerDay = parseFloat(formData.get("pricePerDay") as string);

  if (!title || isNaN(pricePerDay)) throw new Error("Title is required and price must be a valid number.");

  await db.listing.update({
    where: { id: listingId },
    data: { title, description, pricePerDay },
  });

  revalidatePath("/dashboard");
  revalidatePath("/search");
}

export async function respondToBooking(
  requestId: string,
  action: "APPROVE" | "DECLINE"
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return { error: "User not found" };

  const request = await db.callSheetItem.findUnique({
    where: { id: requestId },
    include: {
      listing: { select: { userId: true } },
      service: { select: { userId: true } },
    },
  });

  if (!request) return { error: "Request not found" };

  const ownerId = request.listing?.userId || request.service?.userId;
  if (ownerId !== dbUser.id) return { error: "You do not own this resource" };

  const newStatus = action === "APPROVE" ? "ACCEPTED" : "CANCELLED";

  await db.callSheetItem.update({
    where: { id: requestId },
    data: { status: newStatus },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function submitReview(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return { error: "User not found" };

  const listingId = formData.get("listingId") as string | null;
  const targetUserId = formData.get("targetUserId") as string | null;
  const ratingRaw = parseInt(formData.get("rating") as string, 10);
  const comment = (formData.get("comment") as string)?.trim() || "";

  if (isNaN(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { error: "Rating must be between 1 and 5." };
  }
  const rating = ratingRaw;

  if (!listingId && !targetUserId) {
    return { error: "Review must target a listing or a user." };
  }

  if (listingId) {
    const existing = await db.review.findFirst({
      where: { listingId, authorId: dbUser.id },
    });
    if (existing) return { error: "You have already reviewed this listing." };
  }

  await db.review.create({
    data: {
      rating,
      comment,
      ...(listingId ? { listingId } : {}),
      ...(targetUserId ? { targetUserId } : {}),
      authorId: dbUser.id,
    },
  });

  if (listingId) revalidatePath(`/listing/${listingId}`);
  if (targetUserId) revalidatePath(`/creator/${targetUserId}`);
  return { success: true };
}
