import { db } from "@/lib/db";

export async function GET() {
  try {
  const data = db
  .prepare("SELECT * FROM Records")
  .all();

  //   const data = db
  // .prepare("SELECT * FROM Records WHERE Remarks = 'Done'")
  // .all();


    return new Response(JSON.stringify({ records: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
