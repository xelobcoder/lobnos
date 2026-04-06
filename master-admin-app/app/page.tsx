import { cookies } from "next/headers";
import Link from "next/link";
import { RiFlaskLine, RiTestTubeLine, RiSettings4Line, RiShieldCheckLine, RiArrowRightLine } from "@remixicon/react";
import LogoutButton from "../components/LogoutButton";
import { sessionCookieName, verifySessionToken } from "../lib/auth";

export default function HomePage() {
     const token = cookies().get(sessionCookieName)?.value;
     const session = verifySessionToken(token);

     return (
          <div className="min-vh-100" style={{ background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #4caf50 100%)" }}>

               {/* ── Hero ──────────────────────────────────────────── */}
               <section className="position-relative overflow-hidden py-5">
                    <div className="container position-relative" style={{ zIndex: 2 }}>
                         <div className="row align-items-center py-4">

                              {/* Left — copy */}
                              <div className="col-lg-6 mb-4 mb-lg-0">
                                   <div className="d-flex align-items-center mb-4">
                                        <div
                                             style={{
                                                  background: "rgba(255,255,255,0.12)",
                                                  borderRadius: "1rem",
                                                  padding: "1rem",
                                                  backdropFilter: "blur(4px)",
                                             }}
                                        >
                                             <RiFlaskLine size={52} color="#fbbf24" />
                                        </div>
                                        <div className="ms-3">
                                             <h1
                                                  className="fw-bold mb-0 text-white"
                                                  style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}
                                             >
                                                  Lobnos Master Admin
                                             </h1>
                                             <div className="d-flex align-items-center mt-2 gap-2">
                                                  <span
                                                       className="badge fw-bold px-3 py-2"
                                                       style={{ background: "#fbbf24", color: "#1a1a1a" }}
                                                  >
                                                       PLS
                                                  </span>
                                                  <span className="text-white-50 small">Master Configuration Workspace</span>
                                             </div>
                                        </div>
                                   </div>

                                   <p className="lead text-white fw-normal mb-3">
                                        Centralized Master Database Administration
                                   </p>
                                   <p className="text-white-50 mb-4" style={{ lineHeight: 1.8 }}>
                                        Manage test panel structures, field creation logic, reference configurations, and
                                        laboratory master data — all synchronized with the Lobnos Professional LIMS client.
                                   </p>

                                   <div className="d-flex flex-wrap gap-3">
                                        {session.valid ? (
                                             <>
                                                  <Link
                                                       href="/master/tests"
                                                       className="btn btn-lg px-5 py-3 fw-bold shadow-lg"
                                                       style={{ background: "#fbbf24", color: "#1a1a1a", borderRadius: "0.6rem" }}
                                                  >
                                                       <RiTestTubeLine className="me-2" size={20} />
                                                       Open Master Tests
                                                  </Link>
                                                  <LogoutButton />
                                             </>
                                        ) : (
                                             <Link
                                                  href="/login"
                                                  className="btn btn-lg px-5 py-3 fw-bold shadow-lg"
                                                  style={{ background: "#fbbf24", color: "#1a1a1a", borderRadius: "0.6rem" }}
                                             >
                                                  <RiArrowRightLine className="me-2" size={20} />
                                                  Sign In to Continue
                                             </Link>
                                        )}
                                   </div>
                              </div>

                              {/* Right — status card */}
                              <div className="col-lg-6">
                                   <div
                                        style={{
                                             background: "rgba(255,255,255,0.07)",
                                             backdropFilter: "blur(12px)",
                                             border: "1px solid rgba(255,255,255,0.15)",
                                             borderRadius: "1rem",
                                             padding: "2rem",
                                             color: "white",
                                        }}
                                   >
                                        <h5 className="mb-4 fw-semibold">System Status</h5>

                                        <StatusRow
                                             icon={<RiShieldCheckLine size={18} color="#4ade80" />}
                                             label="Session"
                                             value={session.valid ? "Authenticated" : "Not signed in"}
                                             ok={session.valid}
                                        />
                                        <StatusRow
                                             icon={<RiTestTubeLine size={18} color="#60a5fa" />}
                                             label="Signed in as"
                                             value={session.username || "—"}
                                             ok={!!session.username}
                                        />
                                        <StatusRow
                                             icon={<RiSettings4Line size={18} color="#fbbf24" />}
                                             label="Auth table bootstrap"
                                             value="Enabled (runtime)"
                                             ok={true}
                                        />

                                        {session.valid && (
                                             <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                                                  <p className="small mb-2 fw-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                                                       Quick Access
                                                  </p>
                                                  <div className="d-flex flex-wrap gap-2">
                                                       <QuickLink href="/master/tests" label="Test Panels" />
                                                       <QuickLink href="/master/tests/create" label="Create Test" />
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>
               </section>

               {/* ── Feature cards ────────────────────────────────── */}
               {!session.valid && (
                    <section className="py-5">
                         <div className="container">
                              <div className="row g-4">
                                   <FeatureCard
                                        icon={<RiTestTubeLine size={28} color="#60a5fa" />}
                                        title="Master Test Panels"
                                        desc="Create and manage the canonical test library that all LIMS branches derive from."
                                   />
                                   <FeatureCard
                                        icon={<RiFlaskLine size={28} color="#4ade80" />}
                                        title="Field Creation Logic"
                                        desc="Define parameter types, units, constraints, categories, and clinical reference ranges."
                                   />
                                   <FeatureCard
                                        icon={<RiSettings4Line size={28} color="#fbbf24" />}
                                        title="Configuration Sync"
                                        desc="All changes propagate to connected LIMS clients through a shared master database."
                                   />
                              </div>
                         </div>
                    </section>
               )}

          </div>
     );
}

function StatusRow({
     icon,
     label,
     value,
     ok,
}: {
     icon: React.ReactNode;
     label: string;
     value: string;
     ok: boolean;
}) {
     return (
          <div
               className="d-flex align-items-center justify-content-between py-2"
               style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
               <div className="d-flex align-items-center gap-2" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                    {icon}
                    {label}
               </div>
               <span
                    className="fw-semibold small"
                    style={{ color: ok ? "#4ade80" : "rgba(255,255,255,0.45)" }}
               >
                    {value}
               </span>
          </div>
     );
}

function QuickLink({ href, label }: { href: string; label: string }) {
     return (
          <Link
               href={href}
               className="btn btn-sm fw-semibold"
               style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "0.4rem",
               }}
          >
               {label}
          </Link>
     );
}

function FeatureCard({
     icon,
     title,
     desc,
}: {
     icon: React.ReactNode;
     title: string;
     desc: string;
}) {
     return (
          <div className="col-md-4">
               <div
                    style={{
                         background: "rgba(255,255,255,0.06)",
                         backdropFilter: "blur(8px)",
                         border: "1px solid rgba(255,255,255,0.1)",
                         borderRadius: "1rem",
                         padding: "1.75rem",
                         height: "100%",
                    }}
               >
                    <div className="mb-3">{icon}</div>
                    <h6 className="fw-bold text-white mb-2">{title}</h6>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: 1.7 }}>{desc}</p>
               </div>
          </div>
     );
}
