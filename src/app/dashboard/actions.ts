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
