import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const row = db.prepare("SELECT EmailSetup FROM Records LIMIT 1").get();
    const email = row?.EmailSetup || null;
    return NextResponse.json({ email });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { EmailSetup } = await req.json();

    if (!EmailSetup || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EmailSetup)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Update ALL rows
    const stmt = db.prepare("UPDATE Records SET EmailSetup = ?");
    const info = stmt.run(EmailSetup);

    return NextResponse.json({
      email: EmailSetup,
      updatedRows: info.changes, // <-- number of rows affected
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

}
