"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Email updated successfully");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-sm border border-gray-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            Due Date Email Setup
          </CardTitle>

          <p className="text-sm text-gray-500">
            Configure where reminders and due-date notifications will be sent.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Send to this email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Status Messages */}
            {message && (
              <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-md border border-green-200">
                {message}
              </p>
            )}
            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md border border-red-200">
                {error}
              </p>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white rounded-lg"
            >
              {loading ? "Saving..." : "Save Email"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;