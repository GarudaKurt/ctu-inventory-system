import { db } from "@/lib/db";

// POST: create a new record
export async function POST(request) {
  try {
    const {SampleNo, Items, Program, PartName, ValidationDate, NextValidationDate, Remarks, Comments, Person, IsEmailSend, EmailSetup } = await request.json();

    const data = db.prepare(
      `INSERT INTO Records
      (SampleNo, Items, Program, PartName, ValidationDate, NextValidationDate, Remarks, Comments, Person, IsEmailSend, EmailSetup)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const info = data.run(
      SampleNo,
      Items,
      Program,
      PartName,
      ValidationDate || null,
      NextValidationDate || null,
      Remarks || null,
      Comments || null,
      Person || null,
      IsEmailSend || null,
      EmailSetup || null
    );

    return new Response(
      JSON.stringify({
        message: "Record created successfully",
        recordId: info.lastInsertRowid,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
