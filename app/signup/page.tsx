
"use client";

import BazarHeader from "@/components/BazarHeader";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("দুটি পাসওয়ার্ড মিলছে না।");
      return;
    }

    if (password.length < 8) {
      setMessage("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setMessage(result.error.message || "Sign Up করা যায়নি।");
      } else {
        setMessage("অ্যাকাউন্ট তৈরি হয়েছে! এবার Sign In করুন।");
      }
    } catch {
      setMessage("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(
    provider: "google" | "github"
  ) {
    setMessage("");

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (result.error) {
        setMessage(result.error.message || "লগইন করা যায়নি।");
      }
    } catch {
      setMessage("সোশ্যাল লগইনে সমস্যা হয়েছে।");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-950 placeholder:text-gray-500 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100";

  const labelClass =
    "mb-1 block text-sm font-semibold text-gray-950";

  return (
    <>
      <BazarHeader />

      <main className="min-h-screen bg-green-50 px-4 py-10">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-green-100 bg-white p-6 text-gray-950 shadow-lg sm:p-8">
          <Link
            href="/"
            className="text-sm font-semibold text-green-800 hover:underline"
          >
            ← হোম পেজে ফিরে যান
          </Link>

          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold text-gray-950">
              অ্যাকাউন্ট তৈরি করুন
            </h1>

            <p className="mt-2 text-sm font-medium text-gray-800">
              বিনা খরচে সাইন আপ করে সব বিস্তারিত দাম দেখুন।
            </p>
          </div>

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                নাম
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                autoComplete="name"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                ইমেইল
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                পাসওয়ার্ড
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৮ অক্ষর"
                autoComplete="new-password"
                minLength={8}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="আবার পাসওয়ার্ড লিখুন"
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>

            {message && (
              <p
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-950"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-800 px-4 py-3 font-bold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "অপেক্ষা করুন..." : "অ্যাকাউন্ট তৈরি করুন"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm font-semibold text-gray-800">
              অথবা
            </span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-950 transition hover:bg-gray-100"
            >
              Google দিয়ে চালিয়ে যান
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("github")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-950 transition hover:bg-gray-100"
            >
              GitHub দিয়ে চালিয়ে যান
            </button>
          </div>

          <div className="mt-6 text-center">
  <span className="text-sm font-bold text-black">
    অ্যাকাউন্ট আছে?{" "}
  </span>

  <Link
  href="/signin"
  style={{
    color: "#000000",
    fontWeight: 900,
    textDecoration: "underline",
  }}
>
  সাইন ইন করুন
</Link>
</div>
        </div>
      </main>
    </>
  );
}