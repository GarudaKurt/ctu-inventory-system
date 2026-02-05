import { db } from "@/lib/db";

// POST: create a new record
export async function POST(request) {
  try {
    const { Items, Program, PartName, ValidationDate, NextValidationDate, Remarks, Comments, Person } = await request.json();

    const data = db.prepare(
      `INSERT INTO Records
      (Items, Program, PartName, ValidationDate, NextValidationDate, Remarks, Comments, Person)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const info = data.run(
      Items,
      Program,
      PartName,
      ValidationDate || null,
      NextValidationDate || null,
      Remarks || null,
      Comments || null,
      Person || null
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
