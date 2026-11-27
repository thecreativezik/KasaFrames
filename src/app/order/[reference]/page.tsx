import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { isPaystackConfigured, verifyTransaction } from "@/lib/paystack";
import { formatGhs, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order status",
  description: "Confirmation for your KasaFrames order.",
};

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const transaction = isPaystackConfigured() ? await verifyTransaction(reference) : null;
  const paid = transaction?.status === "success";

  return (
    <div className="shell pb-24 pt-16 lg:pb-36 lg:pt-24">
      <PageIntro title={paid ? "Payment received." : "We're confirming your payment."} />

      <div className="mt-14 max-w-3xl rounded-panel border border-bone/10 bg-bone/[0.03] p-6 sm:p-10">
        <dl className="-mx-6 -mt-6 grid border-b border-bone/10 text-[15px] sm:-mx-10 sm:-mt-10">
          <div className="flex items-baseline justify-between gap-4 border-b border-bone/10 px-6 py-4 last:border-b-0 sm:px-10">
            <dt className="text-bone/60">Reference</dt>
            <dd className="min-w-0 text-right font-mono text-[13px] text-bone [overflow-wrap:anywhere]">{reference}</dd>
          </div>
          {transaction ? (
            <>
              <div className="flex items-baseline justify-between gap-4 border-b border-bone/10 px-6 py-4 last:border-b-0 sm:px-10">
                <dt className="text-bone/60">Amount</dt>
                <dd className="tabular-nums text-bone">{formatGhs(transaction.amountGhs)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-bone/10 px-6 py-4 last:border-b-0 sm:px-10">
                <dt className="text-bone/60">Status</dt>
                <dd className="capitalize text-bone">{transaction.status}</dd>
              </div>
              {transaction.channel ? (
                <div className="flex items-baseline justify-between gap-4 border-b border-bone/10 px-6 py-4 last:border-b-0 sm:px-10">
                  <dt className="text-bone/60">Paid with</dt>
                  <dd className="capitalize text-bone">{transaction.channel.replace(/_/g, " ")}</dd>
                </div>
              ) : null}
            </>
          ) : null}
        </dl>

        <p className="mt-8 max-w-[62ch] text-[15px] leading-relaxed text-bone/60 text-pretty">
          {paid
            ? "Your pieces are queued for framing. The studio will confirm dimensions and installation timing over WhatsApp within 48 hours."
            : "If you completed payment, this page can lag behind the bank by a minute or two—your receipt from Paystack is the record. Send us the reference above and we'll confirm."}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button asChild size="lg">
            <a
              href={whatsappLink(`Hello KasaFrames — checking on order ${reference}.`)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp the studio
            </a>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/collections">Continue browsing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
