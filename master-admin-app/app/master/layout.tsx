import Link from "next/link";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
     return (
          <main className="ma-shell">
               <div className="ma-nav-wrap">
                    <div className="btn-group btn-group-sm" role="group" aria-label="Master navigation">
                         <Link href="/" className="btn btn-outline-secondary">Home</Link>
                         <Link href="/master/tests" className="btn btn-outline-secondary">Master Tests</Link>
                    </div>
                    <span className="ma-pill">Test Management</span>
               </div>
               {children}
          </main>
     );
}
