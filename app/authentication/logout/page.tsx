"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { destroyUserSession } from "../../../components/serverActions/ActionFiltering";

export default function LogoutPage() {
     const router = useRouter();



     return (
          <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
               <div className="shadow border-0 bg-white rounded-4 p-5 text-center" style={{ maxWidth: 400 }}>
                    <h2 className="fw-bold mb-3">Logging out...</h2>
                    <p className="text-muted">
                         You are being signed out. Please wait.
                         <button className="btn btn-primary mt-3" onClick={(ev) =>  {destroyUserSession()}} >
                              Logout
                         </button>
                    </p>
               </div>
          </div>
     );
}
