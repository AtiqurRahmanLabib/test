
"use client";

import { useEffect, useState } from "react";
import { Product, formatPrice, getBanglaDate } from "@/lib/utils";

const API = "https://api.api-store.workers.dev/api/bazardor";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API}/products`);
        if (!response.ok) throw new Error("পণ্যের তথ্য পাওয়া যায়নি");

        const data = await response.json();
        const list = Array.isArray(data) ? data : data.data;

        if (!Array.isArray(list)) {
          throw new Error("API থেকে সঠিক তথ্য পাওয়া যায়নি");
        }

        setProducts(list);
      } catch {
        setError("পণ্যের তথ্য লোড হচ্ছে না। পরে আবার চেষ্টা করো।");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const increased = products
    .filter((p) => p.change?.dir === "up")
    .slice(0, 6);

  const decreased = products
    .filter((p) => p.change?.dir === "down")
    .slice(0, 6);

  function ProductCard({ product }: { product: Product }) {
    return (
      <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
        <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-green-50 text-5xl">
          {product.image || product.categoryIcon || "🛒"}
        </div>
        <h3 className="font-bold text-gray-800">{product.nameBn}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {product.categoryNameBn} · {product.unit}
        </p>
        <p className="mt-3 text-xl font-bold text-green-800">
          ৳{formatPrice(product.today)}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          আগের দাম: ৳{formatPrice(product.yesterday)}
        </p>
        <p
          className={`mt-2 text-sm font-semibold ${
            product.change?.dir === "up"
              ? "text-red-600"
              : product.change?.dir === "down"
                ? "text-green-600"
                : "text-gray-500"
          }`}
        >
          {product.change?.dir === "up"
            ? "▲ দাম বেড়েছে"
            : product.change?.dir === "down"
              ? "▼ দাম কমেছে"
              : "● দাম অপরিবর্তিত"}
          {" "}
          {formatPrice(product.change?.pct ?? 0)}%
        </p>
      </article>
    );
  }

  return (
    <main className="min-h-screen bg-green-50 text-gray-800">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-2xl text-white">
              🛒
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-green-800">
                বাজার দর
              </h1>
              <p className="text-xs text-gray-500">{getBanglaDate()}</p>
            </div>
          </a>
          <div className="flex gap-2">
            <a href="/signin" className="rounded-lg border border-green-700 px-4 py-2 font-semibold text-green-800">
              Sign In
            </a>
            <a href="/signup" className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white">
              Sign Up
            </a>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-3 text-sm font-semibold">
          {["চাল", "ডাল", "তেল", "সবজি", "মাছ", "মাংস", "ডিম-দুধ", "মসলা"].map((name) => (
            <span key={name} className="whitespace-nowrap rounded-full bg-green-100 px-4 py-2 text-green-900">
              {name}
            </span>
          ))}
        </nav>
      </header>

      <div className="overflow-hidden bg-green-800 px-4 py-3 text-white">
        <p className="text-center text-sm font-medium">
          আজকের বাজারদর দেখুন · নিত্যপ্রয়োজনীয় পণ্যের দাম জানুন · সঠিক দামে কেনাকাটা করুন
        </p>
      </div>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
        <div>
          <p className="mb-3 font-bold text-green-700">আপনার প্রতিদিনের বাজার সহকারী</p>
          <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">
            আজকের বাজারদর
            <span className="mt-2 block text-green-700">জানুন সহজেই</span>
          </h2>
          <p className="mt-4 max-w-lg leading-7 text-gray-600">
            চাল, ডাল, তেল, সবজি ও নিত্যপ্রয়োজনীয় পণ্যের দাম এক জায়গায় দেখুন।
            গতকালের দামের সঙ্গে আজকের দাম তুলনা করুন।
          </p>
          <a href="#products" className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800">
            সব পণ্যের দাম দেখুন ↓
          </a>
        </div>
        <div className="flex min-h-64 items-center justify-center rounded-3xl bg-green-100 p-8 text-8xl">
          🧺🥬🥕
        </div>
      </section>

      {loading && (
        <p className="py-10 text-center text-green-800">পণ্যের তথ্য লোড হচ্ছে...</p>
      )}

      {error && (
        <p className="px-4 py-8 text-center text-red-600">{error}</p>
      )}

      {!loading && !error && (
        <>
          <section className="mx-auto max-w-7xl px-4 py-8">
            <h2 className="mb-6 text-2xl font-extrabold">🔺 আজ দাম বেড়েছে</h2>
            {increased.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {increased.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <p className="text-gray-500">এখন কোনো পণ্যের দাম বৃদ্ধির তথ্য নেই।</p>
            )}
          </section>

          <section className="mx-auto max-w-7xl px-4 py-8">
            <h2 className="mb-6 text-2xl font-extrabold">🔻 আজ দাম কমেছে</h2>
            {decreased.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {decreased.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <p className="text-gray-500">এখন কোনো পণ্যের দাম কমার তথ্য নেই।</p>
            )}
          </section>

          <section id="products" className="mx-auto max-w-7xl px-4 py-8 pb-16">
            <h2 className="mb-6 text-2xl font-extrabold">🛍️ সব পণ্য ও বর্তমান দাম</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {products.length === 0 && (
              <p className="py-8 text-center text-gray-500">কোনো পণ্য পাওয়া যায়নি।</p>
            )}
          </section>
        </>
      )}

      <footer className="bg-green-900 px-4 py-6 text-center text-sm text-white">
        © {new Date().getFullYear()} বাজার দর — প্রতিদিনের বাজারদর এক জায়গায়
      </footer>
    </main>
  );
}
