
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Product,
  Category,
  formatPrice,
} from "@/lib/utils";

const API_BASE =
  "https://openapi.programming-hero.com/api/bazardor";

function isImageUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value.startsWith("https://") ||
      value.startsWith("http://") ||
      value.startsWith("/"))
  );
}

function getProductEmoji(product: Product): string {
  const image = (product as Product & { image?: string }).image;

  if (image && !isImageUrl(image)) {
    return image;
  }

  return "🛒";
}

function ProductCard({ product }: { product: Product }) {
  const image = (product as Product & { image?: string }).image;
  const hasImage = isImageUrl(image);

  const today = Number(product.today ?? 0);
  const yesterday = Number(product.yesterday ?? 0);
  const change = Number(product.change?.pct ?? 0);
  const direction = product.change?.dir;

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-green-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-[#f4f8f3]">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.nameBn}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <span className="text-6xl">
            {getProductEmoji(product)}
          </span>
        )}
      </div>

      <h2 className="mt-3 text-lg font-bold text-gray-800">
        {product.nameBn}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        প্রতি {product.unit || "কেজি"}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xl font-bold text-green-800">
          ৳{formatPrice(today)}
        </p>

        {direction && (
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              direction === "up"
                ? "bg-red-100 text-red-700"
                : direction === "down"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {direction === "up"
              ? "▲"
              : direction === "down"
                ? "▼"
                : ""}
            {" "}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-gray-500">
        গতকাল: ৳{formatPrice(yesterday)}
      </p>

      <Link
        href={`/product/${product.slug ?? product.id}`}
        className="mt-4 block rounded-xl bg-green-700 px-4 py-2.5 text-center font-semibold text-white transition hover:bg-green-800"
      >
        বিস্তারিত দেখুন
      </Link>
    </article>
  );
}

function CategoryContent() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug ?? "");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch(
              `${API_BASE}/products?category=${encodeURIComponent(slug)}`,
              { cache: "no-store" }
            ),
            fetch(`${API_BASE}/categories`, {
              cache: "no-store",
            }),
          ]);

        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error("API থেকে তথ্য লোড করা যায়নি।");
        }

        const productsJson = await productsResponse.json();
        const categoriesJson = await categoriesResponse.json();

        if (cancelled) return;

        const productData =
          productsJson?.data ??
          productsJson?.products ??
          [];

        const categoryData =
          categoriesJson?.data ??
          categoriesJson?.categories ??
          [];

        setProducts(
          Array.isArray(productData) ? productData : []
        );

        setCategories(
          Array.isArray(categoryData) ? categoryData : []
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadData();
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const currentCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          (category as Category & { slug?: string }).slug === slug ||
          (category as Category & { id?: string }).id === slug
      ),
    [categories, slug]
  );

  const categoryName =
    (currentCategory as Category & { nameBn?: string })?.nameBn ??
    (currentCategory as Category & { name?: string })?.name ??
    slug;

  return (
    <main className="min-h-screen bg-[#f0f7f1] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-medium text-green-800 hover:text-green-950"
        >
          <span aria-hidden="true">←</span>
          হোম পেজে ফিরে যাও
        </Link>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-green-700">
            বাজারদর
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            {categoryName} বিভাগের পণ্য
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            এই বিভাগের পণ্যের আজকের বাজারদর ও আগের দিনের দামের
            তুলনা দেখো।
          </p>
        </section>

        {loading && (
          <div className="py-16 text-center text-green-800">
            <p className="text-lg font-semibold">
              পণ্যের তথ্য লোড হচ্ছে...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-200 bg-white p-6 text-center text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-green-700 px-5 py-2 font-semibold text-white hover:bg-green-800"
            >
              আবার চেষ্টা করো
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="mt-8 rounded-xl bg-white p-10 text-center">
            <p className="text-4xl">🛒</p>
            <h2 className="mt-3 text-xl font-bold text-gray-800">
              এই বিভাগে কোনো পণ্য পাওয়া যায়নি
            </h2>
            <p className="mt-2 text-gray-600">
              অন্য একটি বিভাগ নির্বাচন করে দেখো।
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="mb-5 mt-8 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                সব পণ্য
              </h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                {products.length}টি পণ্য
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id ?? product.slug}
                  product={product}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f0f7f1] px-4 py-16 text-center text-green-800">
          ক্যাটাগরির পণ্য লোড হচ্ছে...
        </main>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
