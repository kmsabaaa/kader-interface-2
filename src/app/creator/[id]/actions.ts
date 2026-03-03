"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { revalidatePath } from "next/cache";

export async function hireTalent(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "You must be signed in to hire talent." };

  const creatorId = formData.get("creatorId") as string;
  const serviceId = formData.get("serviceId") as string;
  const projectId = formData.get("projectId") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!serviceId || !projectId || !startDateStr || !endDateStr) {
    return { error: "Please fill in all required fields." };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (endDate < startDate) {
    return { error: "End date cannot be before start date." };
  }

  try {
    const dbUser = await db.user.findUnique({ where: { clerkId } });
    if (!dbUser) return { error: "User not found." };

    const service = await db.service.findUnique({
      where: { id: serviceId },
      select: { pricePerDay: true, userId: true },
    });
    if (!service) return { error: "Service not found." };

    // Prevent self-booking
    if (service.userId === dbUser.id) {
      return { error: "You cannot hire yourself." };
    }

    // Check for date conflicts on this service
    const conflict = await db.callSheetItem.findFirst({
      where: {
        serviceId,
        status: { in: ["REQUESTED", "ACCEPTED", "ESCROW_FUNDED"] },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });
    if (conflict) {
      return { error: "These dates are already booked for this service. Please choose different dates." };
    }

    // Calculate cost
    const diff = endDate.getTime() - startDate.getTime();
    let days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days <= 0) days = 1;
    const subtotal = service.pricePerDay * days;
    const fee = subtotal * 0.1;
    const totalCost = subtotal + fee;

    const item = await db.callSheetItem.create({
      data: {
        projectId,
        serviceId,
        startDate,
        endDate,
        totalCost,
        status: "REQUESTED",
      },
    });

    await db.transaction.create({
      data: {
        amount: subtotal,
        fee,
        status: "REQUESTED",
        buyerId: dbUser.id,
        sellerId: service.userId,
        callSheetItemId: item.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/project/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Hire Talent Error:", error);
    return { error: "A server error occurred. Please try again." };
  }
}
