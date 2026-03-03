"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { revalidatePath } from "next/cache";

/**
 * UPDATES A REQUEST STATUS (APPROVE / DENY)
 * Called from the Provider Dashboard to manage incoming gear/talent requests.
 */
export async function updateRequestStatus(
  requestId: string,
  newStatus: "ACCEPTED" | "CANCELLED" | "COMPLETED"
) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized." };

    // 1. Fetch the user's DB record
    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { error: "User not found." };

    // 2. Fetch the request AND the associated Listing/Service to check ownership
    const request = await db.callSheetItem.findUnique({
      where: { id: requestId },
      include: {
        listing: { select: { userId: true } },
        service: { select: { userId: true } }
      }
    });

    if (!request) return { error: "Request not found." };

    // 3. SECURITY: Verify the person clicking "Approve" actually owns the item/service
    const ownerId = request.listing?.userId || request.service?.userId;
    if (ownerId !== dbUser.id) {
      return { error: "Security Breach: You do not own this resource." };
    }

    // 4. Update the status
    await db.callSheetItem.update({
      where: { id: requestId },
      data: { status: newStatus }
    });

    // 5. Refresh the dashboards
    revalidatePath("/dashboard/provider");
    revalidatePath("/dashboard/mission-control");

    return { success: true };

  } catch (err: any) {
    console.error("[UPDATE_STATUS_ERROR]:", err);
    return { error: "System error: Could not update status." };
  }
}
