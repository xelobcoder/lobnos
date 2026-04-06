import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
     title: "Master Admin",
     description: "Master database administration workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
          <html lang="en">
               <body>
                    <div className="ma-topbar py-2 px-3">
                         <div className="container-fluid d-flex align-items-center justify-content-between">
                              <strong className="ma-topbar-title">Master Admin Workspace</strong>
                              <span className="ma-pill">Client-Consistent UI</span>
                         </div>
                    </div>
                    {children}
               </body>
          </html>
     );
}
