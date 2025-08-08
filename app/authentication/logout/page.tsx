"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleLogout } from "../../../components/Auth/customFetch";

export default function LogoutPage() {
     const router = useRouter();
     const [isLoggingOut, setIsLoggingOut] = useState(true);

     useEffect(() => {
          handleLogout(setIsLoggingOut);
     }, [router]);


     return (
          <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
               <div className="shadow border-0 bg-white rounded-4 p-5 text-center" style={{ maxWidth: 400 }}>
                    <h2 className="fw-bold mb-3">
                         {isLoggingOut ? "Logging out..." : "Logged out successfully"}
                    </h2>
                    <p className="text-muted">
                         {isLoggingOut 
                              ? "You are being signed out. Please wait." 
                              : "Redirecting to login page..."
                         }
                    </p>
                    {!isLoggingOut && (
                         <button 
                              className="btn btn-primary mt-3" 
                              onClick={() => router.push('/authentications/login')}
                         >
                              Go to Login
                         </button>
                    )}
               </div>
          </div>
     );
}
