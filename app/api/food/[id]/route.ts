import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Verify user owns this food entry
    const food = await prisma.food.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!food) {
      return NextResponse.json(
        { error: "Food entry not found" },
        { status: 404 }
      );
    }

    if (food.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.food.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting food entry:", error);
    return NextResponse.json(
      { error: "Failed to delete food entry" },
      { status: 500 }
    );
  }
}
