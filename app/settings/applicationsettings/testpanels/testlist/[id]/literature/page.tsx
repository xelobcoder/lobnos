"use client"
import { useParams, useSearchParams } from "next/navigation";
import LiteratureTab from "../../../../../../../components/settingsComponents/test/tabs/LiteratureTab";

// Kept for backward-compatible deep links; the in-place hub at testlist/[id] is the primary entry point now.
export default function LiteratureReviewPage() {
     const params = useParams();
     const searchParams = useSearchParams();
     const litID = searchParams?.get('litid') || (params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : "");

     return <LiteratureTab testid={litID} />;
}