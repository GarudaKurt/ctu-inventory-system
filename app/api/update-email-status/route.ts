// /api/update-email-status/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const { EmailSetup } = await request.json();

    if (!EmailSetup) {
      return NextResponse.json(
        { error: "EmailSetup is required" },
        { status: 400 }
      );
    }

    // Prepare statement safely
    const stmt = db.prepare(`UPDATE Records SET EmailSetup = ?`);
    const info = stmt.run(EmailSetup); // run with the value

    return NextResponse.json({
      success: true,
      message: "Record updated successfully",
      updatedRows: info.changes,
    });
  } catch (err: any) {
    console.error("PUT /update-email-status error:", err);
    return NextResponse.json(
      { error: err.message || "Update failed" },
      { status: 500 }
    );
  }
}
