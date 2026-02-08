import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

// In-memory tracker for last email sent per report (keyed by report ID)
// Format: { reportId: 'YYYY-MM-DD' }
const lastSentDate: Record<number, string> = {};

export async function POST(req: NextRequest) {
  try {
    // Expecting { reports: Report[] } in request body
    const { reports } = await req.json();

    if (!reports || !Array.isArray(reports)) {
      return NextResponse.json(
        { error: "Missing or invalid 'reports' array" },
        { status: 400 }
      );
    }

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const sentReports: number[] = [];

    for (const r of reports) {
      // Only send if report has necessary info and not already sent today
      if (r.ID && r.Person && r.NextValidationDate) {
        if (lastSentDate[r.ID] === today) continue; // already sent today

        await transporter.sendMail({
          from: `"Inventory System" <${process.env.EMAIL_USER}>`,
          to: "aldren.l@pandolink.com", // You can replace with r.Person email if available
          subject: `Report Due Date Reminder ${r.SampleNo}`,
          text: `Hi ${r.Person},\n\nThe report with Sample No ${r.SampleNo} is due on ${r.NextValidationDate}.`,
          html: `<p>Hi <strong>${r.Person}</strong>,</p>
                 <p>The report with Sample No <strong>${r.SampleNo}</strong> is due on <strong>${r.NextValidationDate}</strong>.</p>`,
        });

        lastSentDate[r.ID] = today;
        sentReports.push(r.ID);
      }
    }

    return NextResponse.json({
      message: `Emails sent for ${sentReports.length} report(s)`,
      sentReports,
    });
  } catch (err: any) {
    console.error("Send due date email error:", err);
    return NextResponse.json(
      { error: err.message || "Email send failed" },
      { status: 500 }
    );
  }
}
