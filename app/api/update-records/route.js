import { db } from "@/lib/db";

// PUT: update an existing record
export async function PUT(request) {
  try {
    const { ID, Items, Program, PartName, ValidationDate, NextValidationDate, Remarks, Comments, Person } = await request.json();

    if (!ID) {
      return new Response(
        JSON.stringify({ error: "ID is required to update a record" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stmt = db.prepare(
      `UPDATE Records SET
        Items = ?,
        Program = ?,
        PartName = ?,
        ValidationDate = ?,
        NextValidationDate = ?,
        Remarks = ?,
        Comments = ?,
        Person = ?
      WHERE ID = ?`
    );

    const info = stmt.run(
      Items || null,
      Program || null,
      PartName || null,
      ValidationDate || null,
      NextValidationDate || null,
      Remarks || null,
      Comments || null,
      Person || null,
      ID
    );

    return new Response(
      JSON.stringify({
        message: "Record updated successfully",
        changes: info.changes, // number of rows updated
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
