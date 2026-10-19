
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

export default function BazarHeader() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [date, setDate] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setDate(getBanglaDate());

    async function loadHeaderData() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch(`${API}/categories`),
          fetch(`${API}/products`),
        ]);

        if (categoryResponse.ok) {
          const data: unknown = await categoryResponse.json();
          setCategories(getArray<Category>(data));
        }

        if (productResponse.ok) {
          const data: unknown = await productResponse.json();
          setProducts(getArray<Product>(data).slice(0, 12));
        }
      } catch (error) {
        console.error("Header data error:", error);
      }
    }

    loadHeaderData();
  }, []);

  return (
    <>
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
                {date}
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
      href="/signin"
      style={{ color: "#14532d" }}
      className="rounded-md px-3 py-2 text-sm font-extrabold hover:bg-green-50"
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
        {products.length > 0 ? (
          <div className="animate-marquee flex w-max whitespace-nowrap">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 items-center"
                aria-hidden={copy === 1}
              >
                {products.map((product, index) => (
                  <span
                    key={`${copy}-${product.id ?? product.slug ?? index}`}
                    className="mx-3 inline-flex items-center gap-1.5 text-xs"
                  >
                    <span>{product.categoryIcon || "🛒"}</span>
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
    </>
  );
}
