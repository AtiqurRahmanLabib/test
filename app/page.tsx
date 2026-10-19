
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Product,
  Category,
  formatPrice,
  getBanglaDate,
} from "@/lib/utils";

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

function isImageUrl(value?: string) {
  return Boolean(
    value &&
      (value.startsWith("https://") ||
        value.startsWith("http://") ||
        value.startsWith("/"))
  );
}

function getProductEmoji(product: Product): string {
  const text =
    `${product.nameBn ?? ""} ${product.categoryNameBn ?? ""} ${product.category ?? ""}`.toLowerCase();

  if (/পেঁয়াজ|পেঁয়াজ|onion/.test(text)) return "🧅";
  if (/আলু|potato/.test(text)) return "🥔";
  if (/বেগুন|eggplant/.test(text)) return "🍆";
  if (/মরিচ|pepper|chili/.test(text)) return "🌶️";
  if (/টমেটো|tomato/.test(text)) return "🍅";
  if (/রসুন|garlic/.test(text)) return "🧄";
  if (/আদা|ginger/.test(text)) return "🫚";
  if (/শিম|bean/.test(text)) return "🫛";
  if (/চাল|rice|chal/.test(text)) return "🍚";
  if (/ডাল|lentil|dal/.test(text)) return "🫘";
  if (/তেল|oil|tel/.test(text)) return "🫗";
  if (/মাছ|fish/.test(text)) return "🐟";
  if (/গরু|মাংস|মুরগি|meat|chicken|beef/.test(text)) return "🍗";
  if (/ডিম|egg/.test(text)) return "🥚";
  if (/দুধ|milk/.test(text)) return "🥛";
  if (/লবণ|salt/.test(text)) return "🧂";
  if (/কলা|banana/.test(text)) return "🍌";
  if (/আপেল|apple/.test(text)) return "🍎";
  if (/কমলা|orange/.test(text)) return "🍊";
  if (/লেবু|lemon/.test(text)) return "🍋";

  return product.categoryIcon || "🛒";
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


function ProductCard({ product }: { product: Product }) {
  const emoji = getProductEmoji(product);
  const image = product.image;
  const hasImage = isImageUrl(image);
  const direction = product.change?.dir;
  const percentage = Number(product.change?.pct ?? 0);
  const today = Number(product.today ?? 0);
  const unit = getUnitLabel(product.unit);

  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-[#dce5de] bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/product/${product.slug}`}
        className="flex min-w-0 flex-1 flex-col"
      >
        <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-lg bg-[#f0f8f2]">
          {hasImage ? (
            <img
              src={image}
              alt={product.nameBn || "পণ্যের ছবি"}
              loading="lazy"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="text-3xl" aria-hidden="true">
              {emoji}
            </span>
          )}
        </div>

        <h3 className="min-h-10 text-sm font-bold leading-5 text-gray-900">
          {product.nameBn}
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          {unit}
        </p>

        <div className="mt-auto pt-3">
          <p className="text-xs text-gray-500">আজকের দাম</p>
          <p className="mt-1 text-base font-extrabold leading-6 text-green-800">
            ৳{formatPrice(today)}
            <span className="ml-1 text-[10px] font-normal text-gray-500">
              /{unit}
            </span>
          </p>
        </div>
      </Link>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
        <span className="text-xs text-gray-500">
          পরিবর্তন
        </span>

        <span
          className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold ${
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


function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id ?? product.slug ?? index}
          product={product}
        />
      ))}
    </div>
  );
}


function PriceSection({
  title,
  direction,
  products,
}: {
  title: string;
  direction: "up" | "down";
  products: Product[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:py-5">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-gray-900 sm:text-xl">
        <span className={direction === "up" ? "text-red-600" : "text-green-700"}>
          {direction === "up" ? "▲" : "▼"}
        </span>
        {title}
      </h2>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.id ?? product.slug ?? index}
              product={product}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-[#dce5de] bg-[#fbfdfb] p-4 text-sm text-gray-500">
          {direction === "up"
            ? "আজ দাম বৃদ্ধির কোনো তথ্য পাওয়া যায়নি।"
            : "আজ দাম কমার কোনো তথ্য পাওয়া যায়নি।"}
        </p>
      )}
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [banglaDate, setBanglaDate] = useState("");

  useEffect(() => {
    setBanglaDate(getBanglaDate());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [productResponse, categoryResponse] = await Promise.all([
          fetch(`${API}/products`),
          fetch(`${API}/categories`),
        ]);

        if (!productResponse.ok) {
          throw new Error("Products API failed");
        }

        const productData: unknown = await productResponse.json();
        const productList = getArray<Product>(productData);

        let categoryList: Category[] = [];

        if (categoryResponse.ok) {
          const categoryData: unknown = await categoryResponse.json();
          categoryList = getArray<Category>(categoryData);
        }

        if (!cancelled) {
          setProducts(productList);
          setCategories(categoryList);
        }
      } catch (err) {
        console.error("BazarDor API error:", err);

        if (!cancelled) {
          setError(
            "পণ্যের তথ্য লোড করা যাচ্ছে না। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করো।"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const increased = products
    .filter((product) => product.change?.dir === "up")
    .sort(
      (a, b) =>
        Number(b.change?.pct ?? 0) - Number(a.change?.pct ?? 0)
    )
    .slice(0, 6);

  const decreased = products
    .filter((product) => product.change?.dir === "down")
    .sort(
      (a, b) =>
        Number(b.change?.pct ?? 0) - Number(a.change?.pct ?? 0)
    )
    .slice(0, 6);

  const tickerProducts = products.slice(0, 12);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return Number(a.today ?? 0) - Number(b.today ?? 0);

      case "price-high":
        return Number(b.today ?? 0) - Number(a.today ?? 0);

      case "name":
        return (a.nameBn ?? "").localeCompare(b.nameBn ?? "", "bn");

      default:
        return 0;
    }
  });

  return (
    <main className="min-h-screen bg-[#f0f7f1] text-gray-900">
      <header className="relative z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-700 text-xl text-white">
              🛒
            </span>

            <span className="min-w-0">
              <span className="block text-lg font-extrabold leading-5 text-gray-900">
                বাজার দর
              </span>
              <span className="block text-[10px] text-gray-500">
                {banglaDate}
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/signin"
              className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-green-50"
            >
              সাইন ইন
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
            >
              সাইন আপ
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="মেনু খুলুন"
            aria-expanded={menuOpen}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-lg sm:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div className="flex gap-2 border-t border-gray-100 px-4 py-3 sm:hidden">
            <Link
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="flex-1 rounded-md border border-green-700 px-3 py-2 text-center text-sm font-semibold text-green-800"
            >
              সাইন ইন
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="flex-1 rounded-md bg-green-700 px-3 py-2 text-center text-sm font-semibold text-white"
            >
              সাইন আপ
            </Link>
          </div>
        )}

        <nav
          aria-label="পণ্যের ক্যাটাগরি"
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold text-gray-800 transition hover:bg-green-100"
            >
              <span>{category.icon || "🛒"}</span>
              {category.nameBn}
            </Link>
          ))}
        </nav>
      </header>

      <div className="overflow-hidden border-y border-gray-200 bg-white py-2">
        {tickerProducts.length > 0 ? (
          <div className="animate-marquee flex w-max whitespace-nowrap">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 items-center"
                aria-hidden={copy === 1}
              >
                {tickerProducts.map((product, index) => (
                  <span
                    key={`${copy}-${product.id ?? product.slug ?? index}`}
                    className="mx-3 inline-flex items-center gap-1.5 text-xs"
                  >
                    <span>{getProductEmoji(product)}</span>
                    <span>{product.nameBn}</span>
                    <span className="text-gray-500">
                      ৳{formatPrice(Number(product.today ?? 0))}/
                      {getUnitLabel(product.unit)}
                    </span>
                    <span
                      className={
                        product.change?.dir === "up"
                          ? "font-bold text-red-600"
                          : product.change?.dir === "down"
                            ? "font-bold text-green-700"
                            : "text-gray-500"
                      }
                    >
                      {product.change?.dir === "up"
                        ? "▲"
                        : product.change?.dir === "down"
                          ? "▼"
                          : "—"}{" "}
                      {formatPrice(Number(product.change?.pct ?? 0))}%
                    </span>
                    <span className="text-gray-300">│</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 text-center text-xs text-gray-600">
            আজকের বাজারদর • নিত্যপ্রয়োজনীয় পণ্যের দাম জানুন
          </p>
        )}
      </div>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
        <div className="grid items-center gap-5 rounded-2xl border border-[#dce7df] bg-[#fbfdfb] p-4 sm:p-6 md:grid-cols-2 md:gap-8 md:p-7">
          <div>
            <span className="inline-flex rounded-full bg-[#e0f2e6] px-3 py-1 text-xs font-semibold text-green-800">
              {banglaDate}
            </span>

            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl md:text-4xl">
              আজকের বাজারের দাম এক নজরে
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-gray-600">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
              বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন-সর্বোচ্চ এবং
              দামের পরিবর্তন এক জায়গায়।
            </p>

            <a
              href="#products"
              className="mt-4 inline-flex rounded-md bg-green-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
            >
              সব পণ্য দেখুন ↓
            </a>
          </div>

          <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-xl bg-transparent p-2 sm:min-h-56">
            <img
              src="/bazar-hero.png"
              alt="তাজা শাকসবজির ঝুড়ি"
              className="h-auto max-h-56 w-full object-contain"
            />
          </div>
        </div>
      </section>

      {loading && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <p className="mb-4 text-sm font-semibold text-green-800">
            পণ্যের তথ্য লোড হচ্ছে...
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-2.5"
              >
                <div className="skeleton aspect-[4/3] w-full rounded-md" />
                <div className="skeleton mt-3 h-4 w-3/4" />
                <div className="skeleton mt-2 h-4 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      )}

      {error && (
        <section className="mx-auto max-w-7xl px-4 py-10 text-center">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
          >
            আবার চেষ্টা করো
          </button>
        </section>
      )}

      {!loading && !error && (
        <>
          <PriceSection
            title="আজ দাম বেড়েছে"
            direction="up"
            products={increased}
          />

          <PriceSection
            title="আজ দাম কমেছে"
            direction="down"
            products={decreased}
          />

          <section
            id="products"
            className="mx-auto max-w-7xl scroll-mt-36 px-4 py-4 pb-10 sm:py-5 sm:pb-12"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold sm:text-xl">
                🛍️ সব পণ্য ও বর্তমান দাম
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  সাজান:
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="max-w-52 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-800 outline-none focus:border-green-600"
                  >
                    <option value="default">ডিফল্ট</option>
                    <option value="price-low">দাম: কম থেকে বেশি</option>
                    <option value="price-high">দাম: বেশি থেকে কম</option>
                    <option value="name">নাম অনুযায়ী</option>
                  </select>
                </label>

                <span className="text-xs text-gray-500">
                  মোট পণ্য: {formatPrice(products.length)}
                </span>
              </div>
            </div>

            {sortedProducts.length > 0 ? (
              <ProductGrid products={sortedProducts} />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center">
                <p className="text-4xl">🛒</p>
                <p className="mt-3 text-sm font-semibold text-gray-700">
                  API থেকে কোনো পণ্য পাওয়া যায়নি।
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-md bg-green-700 px-4 py-2 text-sm font-bold text-white"
                >
                  আবার চেষ্টা করো
                </button>
              </div>
            )}
          </section>
        </>
      )}

      <footer className="bg-gray-900 px-4 py-7 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-extrabold"
          >
            <span>🛒</span>
            <span>বাজার দর</span>
          </Link>

          <p className="max-w-xl text-xs leading-5 text-gray-300">
            বাজারের পণ্যের দাম এক জায়গায় জানুন। বাজারে কেনাকাটার
            আগে দাম তুলনা করুন। প্রদর্শিত তথ্যের নির্ভুলতা API
            ডেটার ওপর নির্ভরশীল।
          </p>

          <p className="shrink-0 text-xs text-gray-400">© বাজার দর</p>
        </div>
      </footer>
    </main>
  );
}
