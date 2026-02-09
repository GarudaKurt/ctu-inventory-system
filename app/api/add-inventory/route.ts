import { db } from "@/lib/db";

// create new records
export async function POST(request: Request) {
  try {
    const {
      SampleNo,
      Items,
      Program,
      PartName,
      ValidationDate,
      NextValidationDate,
      Remarks,
      Comments,
      Person,
      IsEmailSend,
      EmailSetup,
    } = await request.json();

    let emailToUse = EmailSetup || null;

    // If EmailSetup is not provided, check existing records
    if (!emailToUse) {
      const row = db
        .prepare("SELECT EmailSetup FROM Records WHERE EmailSetup IS NOT NULL LIMIT 1")
        .get();
      if (row && row.EmailSetup) {
        emailToUse = row.EmailSetup;
      }
    }

    const stmt = db.prepare(
      `INSERT INTO Records
      (SampleNo, Items, Program, PartName, ValidationDate, NextValidationDate, Remarks, Comments, Person, IsEmailSend, EmailSetup)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const info = stmt.run(
      SampleNo || null,
      Items || null,
      Program || null,
      PartName || null,
      ValidationDate || null,
      NextValidationDate || null,
      Remarks || null,
      Comments || null,
      Person || null,
      IsEmailSend || 0,
      emailToUse
    );

    return new Response(
      JSON.stringify({
        message: "Record created successfully",
        recordId: info.lastInsertRowid,
        usedEmail: emailToUse,
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

// PUT: update an existing record
export async function PUT(request: Request) {
  try {
    const { ID, SampleNo, Items, Program, PartName, ValidationDate, NextValidationDate, Remarks, Comments, Person } = await request.json();

    if (!ID) {
      return new Response(
        JSON.stringify({ error: "ID is required to update a record" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stmt = db.prepare(
      `UPDATE Records SET
        SampleNo = ?,
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
      SampleNo || null,
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