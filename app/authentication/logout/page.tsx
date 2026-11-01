"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleLogout } from "../../../components/Auth/customFetch";

export default function LogoutPage() {
     const router = useRouter();
     const [isLoggingOut, setIsLoggingOut] = useState(true);
     const [error, setError] = useState('');

     const signOut = async () => {
          setIsLoggingOut(true);
          setError('');
          if (await handleLogout(setIsLoggingOut) === false) {
               setError('Your browser session could not be cleared. Please retry signing out.');
          }
     };

     useEffect(() => {
          void signOut();
     }, []);


     return (
          <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
               <div className="shadow border-0 bg-white rounded-4 p-5 text-center" style={{ maxWidth: 400 }}>
                    <h2 className="fw-bold mb-3">
                         {isLoggingOut ? "Logging out..." : error ? "Unable to sign out" : "Logged out successfully"}
                    </h2>
                    <p className="text-muted">
                         {error ? error : isLoggingOut
                              ? "You are being signed out. Please wait." 
                              : "Redirecting to login page..."
                         }
                    </p>
                    {!isLoggingOut && (
                         <button 
                              className="btn btn-primary mt-3" 
                              onClick={() => error ? void signOut() : router.replace('/authentications/login')}
                         >
                              {error ? 'Retry sign out' : 'Go to Login'}
                         </button>
                    )}
               </div>
          </div>
     );
}
