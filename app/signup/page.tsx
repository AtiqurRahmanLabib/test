
"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setMessage(result.error.message || "Sign up করা যায়নি।");
      } else {
        setMessage("অ্যাকাউন্ট তৈরি হয়েছে! এবার Sign In করো।");
      }
    } catch {
      setMessage("সমস্যা হয়েছে। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <Link href="/" className="text-sm font-semibold text-green-700">
          ← হোমপেজে ফিরে যাও
        </Link>

        <h1 className="mt-5 text-3xl font-extrabold text-green-800">
          অ্যাকাউন্ট তৈরি করো
        </h1>
        <p className="mt-2 text-gray-600">
          বাজার দর ব্যবহার করতে Sign Up করো।
        </p>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block font-medium">
              তোমার নাম
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-green-700"
              placeholder="সম্পূর্ণ নাম"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block font-medium">
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-green-700"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-medium">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-green-700"
              placeholder="কমপক্ষে ৮ অক্ষর"
            />
          </div>

          {message && (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-bold text-white hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "অপেক্ষা করো..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          আগে অ্যাকাউন্ট আছে?{" "}
          <Link href="/signin" className="font-bold text-green-700">
            Sign In করো
          </Link>
        </p>
      </div>
    </main>
  );
}
