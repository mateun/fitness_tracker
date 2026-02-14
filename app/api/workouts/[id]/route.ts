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

    // Verify user owns this workout
    const workout = await prisma.workout.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Workout not found" },
        { status: 404 }
      );
    }

    if (workout.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.workout.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json(
      { error: "Failed to delete workout" },
      { status: 500 }
    );
  }
}
