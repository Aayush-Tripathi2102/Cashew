import { NextRequest, NextResponse } from "next/server";
import { getBalance } from "@/lib/api";
export async function GET(request: NextRequest) {
  try {
    const response = await fetch("http://localhost:3000/api/v1/token/balance", {
      cache: "no-store",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();

    console.log("getting this from backend", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { error: "Failed to get balance" },
      { status: 500 }
    );
  }
}
