"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const PROCESSING = "Payment is still being processed. It will be applied automatically once the provider confirms it.";
const COPY: Record<string, { tone: string; text: string }> = {
     succeeded: { tone: "success", text: "Payment confirmed. The subscription period is being updated." },
     pending: { tone: "info", text: PROCESSING },
     initiated: { tone: "info", text: PROCESSING },
     failed: { tone: "danger", text: "The payment did not go through. No subscription period was marked paid." },
     cancelled: { tone: "warning", text: "The payment was cancelled. No subscription period was marked paid." },
     expired: { tone: "warning", text: "The checkout expired before payment. Start a new payment if you still need to pay." },
};

// Status comes from the server-side verification redirect and is informational only.
function Result() {
     const params = useSearchParams();
     const reference = params.get("reference") || "";
     const copy = COPY[params.get("status") || ""] ?? { tone: "secondary", text: "We could not determine the payment outcome. Contact support with your reference." };
     return (
          <div className="container py-5" style={{ maxWidth: 640 }}>
               <h1 className="h4">Payment status</h1>
               <p className={`alert alert-${copy.tone}`} role="status">{copy.text}</p>
               {reference && <p className="text-muted">Reference: <span className="font-monospace">{reference.slice(0, 64)}</span></p>}
               <a href="/settings/facilities/payments" className="btn btn-outline-primary">Back to payments</a>
          </div>
     );
}

export default function PaymentReturnPage() {
     return <Suspense fallback={null}><Result /></Suspense>;
}
