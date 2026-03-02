"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../lib/db";
import { revalidatePath } from "next/cache";

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

  const type = formData.get("type") as string;
  
  await db.listing.create({
    data: {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      pricePerDay: parseFloat(formData.get("pricePerDay") as string),
      type,
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
      type: formData.get("type") as string,
      imageUrl: formData.get("imageUrl") as string,
      userId: dbUser.id,
      visibility: "PUBLISHED"
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/search");
}
