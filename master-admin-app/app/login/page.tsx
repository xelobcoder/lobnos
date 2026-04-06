"use client";

import styles from "./login.module.css";
import { RiShieldCrossFill, RiUserLine, RiLockLine, RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
     const router = useRouter();
     const [credentials, setCredentials] = useState({ username: "", password: "" });
     const [showPassword, setShowPassword] = useState(false);
     const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
     const [message, setMessage] = useState("");

     const handleSubmit = async () => {
          if (!credentials.username.trim() || !credentials.password) {
               setStatus("error");
               setMessage("Username and password are required.");
               return;
          }

          setStatus("loading");
          setMessage("");

          try {
               const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                         username: credentials.username.trim(),
                         password: credentials.password,
                    }),
               });

               const payload = await response.json();

               if (!response.ok) {
                    setStatus("error");
                    setMessage(payload?.message || "Login failed.");
                    return;
               }

               setStatus("success");
               setMessage("Login successful. Redirecting...");
               setTimeout(() => {
                    router.push("/");
                    router.refresh();
               }, 800);
          } catch {
               setStatus("error");
               setMessage("Unable to connect to the server.");
          }
     };

     const isLoading = status === "loading" || status === "success";

     return (
          <div className={styles.splitLayout}>
               {/* Left — Branding */}
               <div className={styles.brandingSide}>
                    <div className={styles.brandOverlay} />
                    <div className={styles.brandContent}>
                         <div className={styles.brandLogo}>
                              <RiShieldCrossFill size={48} className={styles.logoIcon} />
                              <span className={styles.brandTitle}>Lobnos Master Admin</span>
                         </div>
                         <div className={styles.brandText}>
                              <h1 className={styles.heroTitle}>Master Database Administration</h1>
                              <p className={styles.heroSubtitle}>
                                   Manage test structures, field creation logic, reference configurations, and core laboratory
                                   data from a single, unified workspace.
                              </p>
                         </div>
                    </div>
               </div>

               {/* Right — Login form */}
               <div className={styles.formSide}>
                    <div className={styles.formContainer}>
                         <div className={styles.loginHeader}>
                              <h2 className={styles.welcomeTitle}>Welcome Back</h2>
                              <p className={styles.welcomeSubtitle}>Sign in to your master admin account to continue</p>
                         </div>

                         {status !== "idle" && (
                              <div
                                   className={`alert border-0 shadow-sm mb-4 py-2 ${status === "error" ? "alert-danger" : "alert-success"
                                        }`}
                              >
                                   {message}
                              </div>
                         )}

                         <div className={styles.loginForm}>
                              <div className={styles.formGroup}>
                                   <label className={styles.formLabel}>Username</label>
                                   <div className={styles.inputWrapper}>
                                        <RiUserLine size={20} className={styles.inputIcon} />
                                        <input
                                             type="text"
                                             className={styles.formInput}
                                             placeholder="Enter your username"
                                             value={credentials.username}
                                             onChange={(e) =>
                                                  setCredentials((p) => ({ ...p, username: e.target.value }))
                                             }
                                             autoComplete="username"
                                             onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                        />
                                   </div>
                              </div>

                              <div className={styles.formGroup}>
                                   <label className={styles.formLabel}>Password</label>
                                   <div className={styles.inputWrapper}>
                                        <RiLockLine size={20} className={styles.inputIcon} />
                                        <input
                                             id="password"
                                             type={showPassword ? "text" : "password"}
                                             className={styles.formInput}
                                             placeholder="Enter your password"
                                             value={credentials.password}
                                             onChange={(e) =>
                                                  setCredentials((p) => ({ ...p, password: e.target.value }))
                                             }
                                             autoComplete="current-password"
                                             onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                        />
                                        <button
                                             type="button"
                                             className={styles.passwordToggle}
                                             onClick={() => setShowPassword((v) => !v)}
                                             aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                             {showPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                                        </button>
                                   </div>
                              </div>

                              <button
                                   type="button"
                                   className={styles.signInButton}
                                   disabled={isLoading}
                                   onClick={handleSubmit}
                              >
                                   {isLoading && (
                                        <span
                                             className="spinner-border spinner-border-sm me-2"
                                             role="status"
                                             aria-hidden="true"
                                        />
                                   )}
                                   <span>{isLoading ? (status === "success" ? "Redirecting..." : "Signing in...") : "Sign In"}</span>
                              </button>
                         </div>

                         <div className={styles.footer}>
                              <p>© {new Date().getFullYear()} Lobnos Professional LIMS. All rights reserved.</p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
