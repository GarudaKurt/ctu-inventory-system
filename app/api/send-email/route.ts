import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

const lastSentDate: Record<number, string> = {};

export async function POST(req: NextRequest) {
  try {
    const { reports } = await req.json(); // send list of reports from front-end

    if (!reports || !Array.isArray(reports)) {
      return NextResponse.json({ error: "Missing reports array" }, { status: 400 });
    }

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
    const sent: number[] = [];

    for (const r of reports) {
      if (r.ID && r.Person && r.NextValidationDate) {
        // skip if email already sent today
        if (lastSentDate[r.ID] === today) continue;

        await transporter.sendMail({
          from: `"Inventory System" <${process.env.EMAIL_USER}>`,
          to: "aldren.l@pandolink.com", // or r.Person email
          subject: `Report Due Date Reminder ${r.SampleNo}`,
          text: `Hi ${r.Person},\n\nThe report with Sample No ${r.SampleNo} is due on ${r.NextValidationDate}.`,
          html: `<p>Hi <strong>${r.Person}</strong>,</p>
                 <p>The report with Sample No <strong>${r.SampleNo}</strong> is due on <strong>${r.NextValidationDate}</strong>.</p>`,
        });

        lastSentDate[r.ID] = today;
        sent.push(r.ID);
      }
    }

    return NextResponse.json({ message: `Emails sent: ${sent.length}`, sent });
  } catch (err: any) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: err.message || "Email send failed" }, { status: 500 });
  }
}
