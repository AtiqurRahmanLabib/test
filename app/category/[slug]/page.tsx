
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Product, Category, formatPrice } from "@/lib/utils";

const API = "https://api.api-store.workers.dev/api/bazardor";

function getArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];

  if (result && typeof result === "object") {
    const obj = result as Record<string, unknown>;

    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.products)) return obj.products as T[];
    if (Array.isArray(obj.categories)) return obj.categories as T[];
  }

  return [];
}

function getUnitLabel(unit?: string) {
  const units: Record<string, string> = {
    kg: "কেজি",
    kilogram: "কেজি",
    litre: "লিটার",
    liter: "লিটার",
    l: "লিটার",
    piece: "পিস",
    pcs: "পিস",
    dozen: "ডজন",
    gram: "গ্রাম",
    g: "গ্রাম",
  };

  return units[(unit || "").toLowerCase()] || unit || "একক";
}

function getEmoji(product: Product) {
  const text =
    `${product.nameBn ?? ""} ${product.categoryNameBn ?? ""} ${product.category ?? ""}`.toLowerCase();

  if (/পেঁয়াজ|পেঁয়াজ|onion/.test(text)) return "🧅";
  if (/আলু|potato/.test(text)) return "🥔";
  if (/বেগুন|eggplant/.test(text)) return "🍆";
  if (/মরিচ|pepper|chili/.test(text)) return "🌶️";
  if (/টমেটো|tomato/.test(text)) return "🍅";
  if (/চাল|rice|chal/.test(text)) return "🍚";
  if (/ডাল|lentil|dal/.test(text)) return "🫘";
  if (/তেল|oil/.test(text)) return "🫗";
  if (/মাছ|fish/.test(text)) return "🐟";
  if (/মাংস|মুরগি|meat|chicken|beef/.test(text)) return "🍗";
  if (/ডিম|egg/.test(text)) return "🥚";
  if (/দুধ|milk/.test(text)) return "🥛";
  if (/রসুন|garlic/.test(text)) return "🧄";
  if (/আদা|ginger/.test(text)) return "🫚";

  return product.categoryIcon || "🛒";
}

function ProductCard({ product }: { product: Product }) {
  const image = product.image;

  const hasImage =
    typeof image === "string" &&
    (image.startsWith("https://") ||
      image.startsWith("http://") ||
      image.startsWith("/"));

  const unit = getUnitLabel(product.unit);
  const direction = product.change?.dir;
  const percentage = Number(product.change?.pct ?? 0);

  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-[#dce5de] bg-white p-3 transition hover:shadow-md">
      <Link
        href={`/product/${product.slug}`}
        className="flex flex-1 flex-col"
      >
        <div className="mb-2 flex h-20 items-center justify-center overflow-hidden rounded-lg bg-[#f0f8f2]">
          {hasImage ? (
            <img
              src={image}
              alt={product.nameBn || "পণ্যের ছবি"}
              loading="lazy"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="text-3xl" aria-hidden="true">
              {getEmoji(product)}
            </span>
          )}
        </div>

        <h2 className="min-h-10 text-sm font-bold leading-5 text-gray-900">
          {product.nameBn}
        </h2>

        <p className="mt-1 text-xs text-gray-500">{unit}</p>

        <div className="mt-auto pt-3">
          <p className="text-xs text-gray-500">আজকের দাম</p>

          <p className="mt-1 text-base font-extrabold text-green-800">
            ৳{formatPrice(Number(product.today ?? 0))}
            <span className="ml-1 text-[10px] font-normal text-gray-500">
              /{unit}
            </span>
          </p>
        </div>
      </Link>

      <div className="mt-2 flex items-center justify-between gap-1 border-t border-gray-100 pt-2">
        <span className="text-xs text-gray-500">পরিবর্তন</span>

        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold ${
            direction === "up"
              ? "bg-red-50 text-red-600"
              : direction === "down"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {direction === "up" ? "▲" : direction === "down" ? "▼" : "—"}{" "}
          {formatPrice(percentage)}%
        </span>
      </div>
    </article>
  );
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Dynamic route থেকে slug নেওয়া
  useEffect(() => {
    let cancelled = false;

    params.then(({ slug }) => {
      if (!cancelled) {
        setSlug(decodeURIComponent(slug));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params]);

  // API থেকে পণ্য ও ক্যাটাগরি লোড
  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch(
            `${API}/products?category=${encodeURIComponent(slug)}`
          ),
          fetch(`${API}/categories`),
        ]);

        if (!productResponse.ok) {
          throw new Error("পণ্যের তথ্য পাওয়া যায়নি");
        }

        const productData: unknown = await productResponse.json();
        const productList = getArray<Product>(productData);

        let categoryList: Category[] = [];

        if (categoryResponse.ok) {
          const categoryData: unknown =
            await categoryResponse.json();

          categoryList = getArray<Category>(categoryData);
        }

        if (!cancelled) {
          setProducts(productList);
          setCategories(categoryList);
        }
      } catch (err) {
        console.error("Category API error:", err);

        if (!cancelled) {
          setError(
            "ক্যাটাগরির পণ্য লোড করা যাচ্ছে না। আবার চেষ্টা করো।"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const category = categories.find((item) => item.slug === slug);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number(a.today ?? 0) - Number(b.today ?? 0);

        case "price-high":
          return Number(b.today ?? 0) - Number(a.today ?? 0);

        case "name":
          return (a.nameBn ?? "").localeCompare(
            b.nameBn ?? "",
            "bn"
          );

        default:
          return 0;
      }
    });
  }, [products, sortBy]);

  return (
    <main className="min-h-screen bg-[#f0f7f1] text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-extrabold">
            🛒 বাজার দর
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
          >
            ← হোম পেজ
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="mb-6 rounded-2xl border border-[#dce5de] bg-white p-4 sm:p-6">
          <p className="text-sm text-gray-500">
            <Link href="/" className="hover:text-green-700">
              হোম
            </Link>
            {" / "}ক্যাটাগরি
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {category?.icon ? `${category.icon} ` : ""}
            {category?.nameBn || "ক্যাটাগরির পণ্য"}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            এই ক্যাটাগরির পণ্যের বর্তমান দাম দেখো এবং তুলনা করো।
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">
            সব পণ্য
            {!loading && ` (${formatPrice(sortedProducts.length)})`}
          </h2>

          <label className="flex items-center gap-2 text-xs text-gray-600">
            সাজান:

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-800"
            >
              <option value="default">ডিফল্ট</option>
              <option value="price-low">দাম: কম থেকে বেশি</option>
              <option value="price-high">দাম: বেশি থেকে কম</option>
              <option value="name">নাম অনুযায়ী</option>
            </select>
          </label>
        </div>

        {loading && (
          <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
            পণ্যের তথ্য লোড হচ্ছে...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white"
            >
              আবার চেষ্টা করো
            </button>
          </div>
        )}

        {!loading && !error && sortedProducts.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-4xl">🛒</p>

            <p className="mt-3 font-semibold">
              এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
            </p>

            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white"
            >
              সব পণ্য দেখো
            </Link>
          </div>
        )}

        {!loading && !error && sortedProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {sortedProducts.map((product, index) => (
              <ProductCard
                key={product.id ?? product.slug ?? index}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
