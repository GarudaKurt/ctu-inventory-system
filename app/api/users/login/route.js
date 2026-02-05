import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log("API called with:", email, password);

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400 }
      );
    }

    // Exact match using your DB column names
    const user = db
      .prepare("SELECT * FROM Users WHERE Email = ?")
      .get(email);

    console.log("User fetched from DB:", user);

    if (!user) {
      console.log("User not found");
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Match column names exactly
    if (user.Password !== password) {
      console.log("Password mismatch for", user.Email);
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
      });
    }

    console.log("Login successful:", user.Email);

    return new Response(
      JSON.stringify({
        message: "Login successful",
        user: { id: user.ID, email: user.Email, role: user.Role },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
