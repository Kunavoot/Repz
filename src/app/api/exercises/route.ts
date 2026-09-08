import { NextResponse } from "next/server";
import { getExercisesList } from "@/actions/custom-routine";

export async function GET() {
  try {
    const exercises = await getExercisesList();
    return NextResponse.json(exercises);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}
