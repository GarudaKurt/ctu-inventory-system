export const runtime = "nodejs";

import { db } from "@/lib/db";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idFromQuery = searchParams.get("id");
    let ID = idFromQuery ? Number(idFromQuery) : null;

    if (!ID) {
      try {
        const body = await request.json();
        if (body && typeof body.ID !== "undefined") {
          ID = Number(body.ID);
        }
      } catch {
      }
    }

    if (!ID || Number.isNaN(ID)) {
      return new Response(
        JSON.stringify({ error: "ID (number) is required to delete a record" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stmt = db.prepare("DELETE FROM Records WHERE ID = ?");
    const info = stmt.run(ID);

    return new Response(
      JSON.stringify({
        message: info.changes > 0 ? "Record deleted" : "No record found for given ID",
        changes: info.changes,
        id: ID,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}