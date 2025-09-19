import { NextRequest, NextResponse } from "next/server";

interface CreatePlanRequest {
  token: string;
  amount: string | number;
  interval: string | number;
  metadata?: string;
}

interface CreatePlanResponse {
  txHash: string;
  planId: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePlanRequest = await request.json();
    const { token, amount, interval, metadata } = body;

    // Validate required fields
    if (!token || !amount || !interval) {
      return NextResponse.json(
        { error: "Missing required parameters: token, amount, interval" },
        { status: 400 }
      );
    }

    // Make request to the backend API
    const response = await fetch("https://cashew-7fqo.onrender.com/api/v1/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        amount,
        interval,
        metadata: metadata || "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Backend API responded with status: ${response.status} - ${
          errorData.error || "Unknown error"
        }`
      );
    }

    const data: CreatePlanResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
