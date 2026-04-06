"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RiLogoutBoxLine } from "@remixicon/react";

export default function LogoutButton() {
     const router = useRouter();
     const [loading, setLoading] = useState(false);

     return (
          <button
               type="button"
               className="btn btn-lg px-4 py-3 fw-semibold"
               style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: "0.6rem",
                    backdropFilter: "blur(4px)",
               }}
               disabled={loading}
               onClick={async () => {
                    setLoading(true);
                    try {
                         await fetch("/api/auth/logout", { method: "POST" });
                         router.push("/login");
                         router.refresh();
                    } finally {
                         setLoading(false);
                    }
               }}
          >
               <RiLogoutBoxLine size={18} className="me-2" />
               {loading ? "Signing out..." : "Sign Out"}
          </button>
     );
}

