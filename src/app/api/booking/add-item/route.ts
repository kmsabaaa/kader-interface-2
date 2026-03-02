import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { listingId, projectId, pricePerDay } = await req.json();

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return new NextResponse("User not found", { status: 404 });

    // Verify ownership of project
    const project = await db.project.findUnique({
      where: { id: projectId, userId: dbUser.id }
    });

    if (!project) return new NextResponse("Project not found", { status: 404 });
    
    // Get listing details to find seller
    const listing = await db.listing.findUnique({
      where: { id: listingId }
    });
    
    if (!listing) return new NextResponse("Listing not found", { status: 404 });

    // Create CallSheetItem (Transaction Request)
    const item = await db.callSheetItem.create({
      data: {
        projectId,
        listingId,
        status: "REQUESTED",
        totalCost: pricePerDay, 
      }
    });

    // Create the Transaction Record
    await db.transaction.create({
      data: {
        amount: pricePerDay,
        fee: pricePerDay * 0.10, 
        status: "REQUESTED",
        buyerId: dbUser.id,
        sellerId: listing.userId,
        callSheetItemId: item.id
      }
    });

    return NextResponse.json(item);

  } catch (error) {
    console.log("[BOOKING_ADD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
