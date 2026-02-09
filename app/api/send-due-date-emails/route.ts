// /api/send-due-date-emails/route.ts
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function POST(req: NextRequest) {
  try {
    const { reports } = await req.json();
    console.log("[DEBUG] /send-due-date-emails received reports:", reports);

    if (!reports || !Array.isArray(reports)) {
      return NextResponse.json({ error: "Invalid reports array" }, { status: 400 });
    }

    // Fetch email setup
    const setupStmt = db.prepare(`SELECT EmailSetup FROM Records LIMIT 1`);
    const setup = setupStmt.get();
    const notificationEmail = setup?.EmailSetup;

    console.log("[DEBUG] Notification email fetched from DB:", notificationEmail);

    if (!notificationEmail) {
      return NextResponse.json({ message: "No email configured", sentReports: [] });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const sentReports: number[] = [];

    for (const r of reports) {
      console.log(`[DEBUG] Processing report ID ${r.ID}, SampleNo: ${r.SampleNo}`);

      if (!r.ID || !r.Person || !r.NextValidationDate) {
        console.log(`[DEBUG] Skipping invalid report:`, r);
        continue;
      }

      // Check if email already sent
      const checkStmt = db.prepare(`SELECT IsEmailSend FROM Records WHERE ID = ?`);
      const dbRecord = checkStmt.get(r.ID);
      if (dbRecord?.IsEmailSend === 1) {
        console.log(`[DEBUG] Email already sent for report ID ${r.ID}, skipping.`);
        continue;
      }

      console.log(`[DEBUG] Sending email for report ID ${r.ID}...`);
      await transporter.sendMail({
        from: `"Inventory System" <${process.env.EMAIL_USER}>`,
        to: notificationEmail,
        subject: `Report Due Date Reminder ${r.SampleNo}`,
        text: `Hi ${r.Person},\nReport ${r.SampleNo} is due on ${r.NextValidationDate}.`,
        html: `<p>Hi <strong>${r.Person}</strong>,</p>
               <p>Report <strong>${r.SampleNo}</strong> is due on <strong>${r.NextValidationDate}</strong>.</p>`,
      });

      const updateStmt = db.prepare(`UPDATE Records SET IsEmailSend = 1 WHERE ID = ?`);
      updateStmt.run(r.ID);
      sentReports.push(r.ID);

      console.log(`[DEBUG] Email sent and record updated for ID ${r.ID}`);
    }

    console.log(`[DEBUG] All done, sent emails for reports:`, sentReports);

    return NextResponse.json({
      message: `Emails sent for ${sentReports.length} reports`,
      sentReports,
    });
  } catch (err: any) {
    console.error("[ERROR] /send-due-date-emails failed:", err);
    return NextResponse.json(
      { error: err.message || "Email send failed" },
      { status: 500 }
    );
  }
}
