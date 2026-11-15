"use client";

import { useRouter } from "next/navigation";
import { useVisibleRefresh } from "../../../components/useVisibleRefresh";

export function RefreshPublicDirectory() {
    const router = useRouter();
    useVisibleRefresh(() => router.refresh());
    return null;
}
