import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";

type Market = {
  name?: string;
  marketName?: string;
  division?: string;
  min?: number;
  max?: number;
  price?: number;
};

type Product = {
  id: number | string;
  slug: string;
  nameBn: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  image?: string;
  unit?: string;
  today?: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;
  change?: {
    dir?: string;
    pct?: number;
  };
  markets?: Market[];
};

const API_URL =
  "https://openapi.programming-hero.com/api/bazardor/products";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Products API failed: ${response.status}`);
    }

    const result = await response.json();

    const products: Product[] = Array.isArray(result)
      ? result
      : Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.products)
          ? result.products
          : [];

    return products.find((product) => product.slug === slug) ?? null;
  } catch (error) {
    console.error("Failed to load product:", error);
    throw error;
  }
}

function formatPrice(value?: number) {
  if (value == null || !Number.isFinite(Number(value))) {
    return "দাম পাওয়া যায়নি";
  }

  return `৳${Number(value).toLocaleString("en-BD")}`;
}

async function ProductDetailsContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Check whether the visitor is logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Send logged-out visitors to the sign-in page
  if (!session) {
    redirect("/signin");
  }

  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const markets = product.markets ?? [];

  const marketPrices = markets.flatMap((market) => {
    const prices: number[] = [];

    if (typeof market.min === "number") {
      prices.push(market.min);
    }

    if (typeof market.max === "number") {
      prices.push(market.max);
    }

    if (
      prices.length === 0 &&
      typeof market.price === "number"
    ) {
      prices.push(market.price);
    }

    return prices;
  });

  const minPrice =
    marketPrices.length > 0
      ? Math.min(...marketPrices)
      : null;

  const maxPrice =
    marketPrices.length > 0
      ? Math.max(...marketPrices)
      : null;

  return (
    <main className="min-h-screen bg-green-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-700">
            হোম
          </Link>
          <span>/</span>
          <span>{product.categoryNameBn ?? "পণ্য"}</span>
          <span>/</span>
          <span className="font-medium text-gray-800">
            {product.nameBn}
          </span>
        </nav>

        <section className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-7 md:grid-cols-2">
            <div className="flex min-h-64 items-center justify-center rounded-xl bg-green-50 p-8">
              <span
                className="text-8xl"
                role="img"
                aria-label={product.nameBn}
              >
                {product.image &&
                !product.image.startsWith("http")
                  ? product.image
                  : product.categoryIcon ?? "🛒"}
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <p className="mb-2 text-sm font-medium text-green-700">
                {product.categoryNameBn ?? "বাজার পণ্য"}
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                {product.nameBn}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                একক: {product.unit ?? "প্রযোজ্য একক"}
              </p>

              <p className="mt-5 text-sm text-gray-500">
                আজকের দাম
              </p>

              <p className="mt-1 text-3xl font-bold text-green-700">
                {formatPrice(product.today)}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  / {product.unit ?? ""}
                </span>
              </p>

              {product.change?.dir && (
                <p
                  className={`mt-3 w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                    product.change.dir === "up"
                      ? "bg-red-100 text-red-700"
                      : product.change.dir === "down"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {product.change.dir === "up"
                    ? "▲ দাম বেড়েছে"
                    : product.change.dir === "down"
                      ? "▼ দাম কমেছে"
                      : "— দাম অপরিবর্তিত"}
                  {" "}
                  {product.change.pct != null
                    ? `${product.change.pct}%`
                    : ""}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    গতকালের দাম
                  </p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {formatPrice(product.yesterday)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    গত সপ্তাহের দাম
                  </p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {formatPrice(product.lastWeek)}
                  </p>
                </div>

                <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">
                    গত মাসের দাম
                  </p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {formatPrice(product.lastMonth)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-gray-900">
            বাজারভিত্তিক দামের তুলনা
          </h2>

          {minPrice !== null && maxPrice !== null && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm text-gray-600">
                  সর্বনিম্ন দাম
                </p>
                <p className="mt-1 text-xl font-bold text-green-700">
                  {formatPrice(minPrice)}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-sm text-gray-600">
                  সর্বোচ্চ দাম
                </p>
                <p className="mt-1 text-xl font-bold text-red-700">
                  {formatPrice(maxPrice)}
                </p>
              </div>
            </div>
          )}

          {markets.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[440px] text-left text-sm">
                <thead className="bg-green-50 text-gray-700">
                  <tr>
                    <th className="p-3">বাজার</th>
                    <th className="p-3">বিভাগ</th>
                    <th className="p-3">সর্বনিম্ন</th>
                    <th className="p-3">সর্বোচ্চ</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map((market, index) => (
                    <tr
                      key={`${
                        market.name ?? market.marketName ?? "market"
                      }-${index}`}
                      className="border-b border-gray-100"
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {market.name ?? market.marketName ?? "বাজার"}
                      </td>
                      <td className="p-3 text-gray-600">
                        {market.division ?? "—"}
                      </td>
                      <td className="p-3 text-green-700">
                        {formatPrice(market.min ?? market.price)}
                      </td>
                      <td className="p-3 text-gray-800">
                        {formatPrice(market.max ?? market.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-gray-50 p-4 text-gray-600">
              এই পণ্যের বাজারভিত্তিক তথ্য পাওয়া যায়নি।
            </p>
          )}
        </section>

        <div className="mt-7">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            ← হোমপেজে ফিরে যাও
          </Link>
        </div>
      </div>
    </main>
  );
}
export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-green-50 p-8 text-center">
          পণ্যের তথ্য লোড হচ্ছে...
        </main>
      }
    >
      <ProductDetailsContent params={params} />
    </Suspense>
  );
}
