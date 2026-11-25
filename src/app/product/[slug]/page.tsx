import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getProduct, products } from "@/lib/data/catalog";
import { ProductConfigurator } from "@/components/product/product-configurator";
import { formatGhs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Product" };
  return { title: p.name, description: p.tagline };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const collection = getCollection(product.collection);

  return (
    <div className="shell pb-24 pt-12 lg:pb-36 lg:pt-16">
      {collection ? (
        <Link
          href={`/collections/${collection.slug}`}
          className="mb-6 inline-flex min-h-11 items-center text-[13px] text-bone/60 transition-colors hover:text-bone"
        >
          ← {collection.title}
        </Link>
      ) : null}

      <ProductConfigurator product={product} />

      <section className="mt-24 grid grid-cols-1 gap-10 border-t border-bone/10 pt-14 lg:mt-32 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <h2 className="text-display-sm text-balance">Every size, every price.</h2>
          <p className="mt-5 text-[15px] leading-relaxed text-bone/60 text-pretty">
            The full list, so you can work out the cost before you talk to us. Installation is a flat{" "}
            {formatGhs(product.installationGhs)} per frame and is optional.
          </p>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <div className="overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full min-w-[32rem] text-left text-[15px]">
              <thead className="text-[13px] text-bone/50">
                <tr className="border-b border-bone/15">
                  <th scope="col" className="py-3 pr-4 font-normal">
                    Size (inches)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">
                    Frame
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">
                    Installation
                  </th>
                  <th scope="col" className="py-3 pl-4 text-right font-normal">
                    Total per frame
                  </th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {product.sizes.map((size) => (
                  <tr key={size.label} className="border-b border-bone/10">
                    <th scope="row" className="py-4 pr-4 font-normal text-bone">
                      {size.label}
                    </th>
                    <td className="px-4 py-4 text-right text-bone/70">{formatGhs(size.frameGhs)}</td>
                    <td className="px-4 py-4 text-right text-bone/50">{formatGhs(product.installationGhs)}</td>
                    <td className="py-4 pl-4 text-right text-bone">
                      {formatGhs(size.frameGhs + product.installationGhs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-[62ch] text-[13px] leading-relaxed text-bone/50">
            A 50% deposit confirms the order. Custom sizes are possible: ask and we will quote before anything is
            made.{" "}
            <Link href="/policies" className="text-bone/70 underline underline-offset-4 hover:text-bone">
              How we work
            </Link>
          </p>
        </div>
      </section>

      <section className="mt-20 grid grid-cols-1 gap-12 border-t border-bone/10 pt-14 lg:mt-28 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <h2 className="text-display-sm">About this frame</h2>
        </div>
        <div className="grid gap-12 lg:col-span-8 lg:grid-cols-2 lg:gap-10">
          <p className="max-w-[60ch] text-lead font-light text-bone/70 text-pretty lg:col-span-2">{product.longDescription}</p>
          <div>
            <h2 className="text-title">Highlights</h2>
            <ul className="mt-5 border-t border-bone/10 text-[15px] text-bone/60">
              {product.highlights.map((h) => (
                <li key={h} className="border-b border-bone/10 py-3">
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-title">Ideal for</h2>
            <ul className="mt-5 border-t border-bone/10 text-[15px] text-bone/60">
              {product.idealFor.map((h) => (
                <li key={h} className="border-b border-bone/10 py-3">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
