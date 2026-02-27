"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../lib/db";
import { revalidatePath } from "next/cache";

export async function createNewProject(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { error: "User not synced" };

    const title = (formData.get("title") as string)?.trim();
    if (!title || title.length === 0) return { error: "Project title is required" };
    if (title.length > 200) return { error: "Project title must be under 200 characters" };
    
    const budgetRaw = parseFloat(formData.get("budget") as string);
    if (isNaN(budgetRaw) || budgetRaw < 0) return { error: "Budget must be a positive number" };
    const budget = budgetRaw;

    await db.project.create({
      data: {
        title,
        description: "A new cinematic production.",
        budget,
        userId: dbUser.id,
      },
    });

    revalidatePath("/dashboard"); 
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create project";
    return { error: message };
  }
}

export async function toggleUserRole() {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { error: "User not synced" };

    const newRole = dbUser.role === "CONSUMER" ? "PROVIDER" : "CONSUMER";
    
    await db.user.update({
      where: { id: dbUser.id },
      data: { role: newRole }
    });

    revalidatePath("/dashboard"); 
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle role";
    return { error: message };
  }
}

export async function createNewListing(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { error: "User not synced" };

    const title = (formData.get("title") as string)?.trim();
    if (!title || title.length === 0) return { error: "Listing title is required" };
    if (title.length > 200) return { error: "Title must be under 200 characters" };
    
    const description = (formData.get("description") as string)?.trim();
    if (!description || description.length === 0) return { error: "Description is required" };
    if (description.length > 2000) return { error: "Description must be under 2000 characters" };
    
    const priceRaw = parseFloat(formData.get("pricePerDay") as string);
    if (isNaN(priceRaw) || priceRaw <= 0) return { error: "Price must be greater than 0" };
    const pricePerDay = priceRaw;
    
    const type = formData.get("type") as string;
    const validTypes = ["EQUIPMENT", "LOCATION"];
    if (!validTypes.includes(type)) return { error: "Invalid listing type" };
    
    const uploadedImageUrl = formData.get("imageUrl") as string;

    let finalImage = uploadedImageUrl;
    if (!finalImage) {
      if (type === "LOCATION") finalImage = "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056&auto=format&fit=crop"; 
      else finalImage = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1964&auto=format&fit=crop"; 
    }

    if (type === "LOCATION") {
      await db.listing.create({
        data: {
          title,
          description,
          pricePerDay,
          type: type, 
          userId: dbUser.id,
          imageUrl: finalImage,
          locationProfile: {
            create: { permitStatus: "Pending Assessment" }
          }
        },
      });
    } else {
      await db.listing.create({
        data: {
          title,
          description,
          pricePerDay,
          type: type, 
          userId: dbUser.id,
          imageUrl: finalImage
        },
      });
    }

    revalidatePath("/dashboard"); 
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create listing";
    return { error: message };
  }
}

export async function respondToBooking(bookingId: string, newStatus: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { error: "User not synced" };

    const booking = await db.callSheetItem.findUnique({
      where: { id: bookingId },
      include: { listing: true, service: true }
    });

    if (!booking) return { error: "Booking not found" };
    
    // Prevent re-responding to an already decided booking
    if (booking.status !== "PENDING") {
      return { error: "This booking has already been responded to." };
    }

    const isListingOwner = booking.listing?.userId === dbUser.id;
    const isServiceOwner = booking.service?.userId === dbUser.id;
    
    if (!isListingOwner && !isServiceOwner) {
      return { error: "Unauthorized: You don't own this resource" };
    }

    const validStatuses = ["PENDING", "APPROVED", "DECLINED"];
    if (!validStatuses.includes(newStatus)) {
      return { error: "Invalid status" };
    }

    await db.callSheetItem.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    revalidatePath("/dashboard"); 
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to respond to booking";
    return { error: message };
  }
}

export async function updateCreatorProfile(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { error: "User not synced" };

    const creatorTitle = formData.get("creatorTitle") as string;
    const creatorBio = formData.get("creatorBio") as string;
    const showreelUrl = formData.get("showreelUrl") as string;

    await db.user.update({
      where: { id: dbUser.id },
      data: {
        isCreator: true,
        creatorTitle,
        creatorBio,
        showreelUrl
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return { error: message };
  }
}

export async function createNewService(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { error: "User not synced" };

    const title = (formData.get("title") as string)?.trim();
    if (!title || title.length === 0) return { error: "Service title is required" };
    if (title.length > 200) return { error: "Title must be under 200 characters" };

    const description = (formData.get("description") as string)?.trim();
    if (!description || description.length === 0) return { error: "Description is required" };
    if (description.length > 2000) return { error: "Description must be under 2000 characters" };

    const priceRaw = parseFloat(formData.get("pricePerDay") as string);
    if (isNaN(priceRaw) || priceRaw <= 0) return { error: "Price must be greater than 0" };
    const pricePerDay = priceRaw;

    await db.service.create({
      data: {
        title,
        description,
        pricePerDay,
        userId: dbUser.id,
      },
    });

    revalidatePath("/dashboard"); 
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create service";
    return { error: message };
  }
}