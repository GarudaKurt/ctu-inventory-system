import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();

    console.log("Register API called with:", email, password, role);

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400 }
      );
    }

    const existingUser = db
      .prepare("SELECT * FROM Users WHERE Email = ?")
      .get(email);

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 409 }
      );
    }

    const insert = db.prepare(
      "INSERT INTO Users (Email, Password, Role) VALUES (?, ?, ?)"
    );
    const result = insert.run(email, password, role || "user");

    console.log("User created with ID:", result.lastInsertRowid);

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: { id: result.lastInsertRowid, email, role: role || "user" },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
