    // File: /app/api/setup-email/route.ts
import { NextRequest, NextResponse } from "next/server";

// For now, store the notification email in memory
// You can replace with DB later
let notificationEmail: string | null = null;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'email' field" },
        { status: 400 }
      );
    }

    notificationEmail = email;

    console.log("Notification email set to:", notificationEmail);

    return NextResponse.json({
      message: `Email notifications will be sent to ${notificationEmail}`,
    });
  } catch (err: any) {
    console.error("Setup email error:", err);
    return NextResponse.json(
      { error: err.message || "Setup email failed" },
      { status: 500 }
    );
  }
}

// Optional GET to check current setup email
export async function GET() {
  return NextResponse.json({ email: notificationEmail || null });
}
