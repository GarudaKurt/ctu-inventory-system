import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const { email, newPassword } = await request.json();

    console.log("Forgot Password API called with:", email, newPassword);

    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Email and new password are required" }),
        { status: 400 }
      );
    }

    const user = db
      .prepare("SELECT * FROM Users WHERE Email = ?")
      .get(email);

    if (!user) {
      console.log("User not found:", email);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    const update = db
      .prepare("UPDATE Users SET Password = ? WHERE Email = ?")
      .run(newPassword, email);

    console.log("Password updated for:", email);

    return new Response(
      JSON.stringify({ message: "Password successfully updated" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
