"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

interface Scene {
  id: number;
  label: string;
  badge: string;
  title: string;
  description: string;
  status: string;
  metricLabel: string;
  metricValue: string;
}

const scenes: Scene[] = [
  {
    id: 1,
    label: "Overview",
    badge: "01 / PLATFORM REVEAL",
    title: "One Intelligent Platform for Modern Laboratories",
    description: "Unifying clinical specimen handling, patient records, billing and facility management in a single connected system.",
    status: "Illustrative preview",
    metricLabel: "Connected Workflows",
    metricValue: "Clinical to finance",
  },
  {
    id: 2,
    label: "Registration",
    badge: "02 / PATIENT INTAKE",
    title: "Fast, Traceable Patient Intake",
    description: "Generate unique facility records, capture clinical demographics, and link requested test panels directly to laboratory queues.",
    status: "Example record · SYN-PAT-1082",
    metricLabel: "Workflow",
    metricValue: "Patient intake",
  },
  {
    id: 3,
    label: "Billing & Samples",
    badge: "03 / BILLING & BARCODING",
    title: "Tariffs, Payment & Specimen Hand-Off",
    description: "Use configured tariffs, recorded payments and barcode labels to support billing and specimen workflows.",
    status: "Example barcode · BAR-8821-EDTA",
    metricLabel: "Workflow",
    metricValue: "Billing & specimens",
  },
  {
    id: 4,
    label: "Processing",
    badge: "04 / ANALYZER INTEGRATION",
    title: "Configured Analyzer Interfaces & Processing",
    description: "Supported analyzer-result adapters can map readings to laboratory test fields. Each device, protocol and deployment requires validation.",
    status: "Device validation required",
    metricLabel: "Integration review",
    metricValue: "Model & protocol",
  },
  {
    id: 5,
    label: "Results",
    badge: "05 / REVIEW & APPROVAL",
    title: "Structured Validation & Clinical Sign-off",
    description: "Configured reference ranges and critical-result alerts support review before authorized report release.",
    status: "Example result review",
    metricLabel: "Review workflow",
    metricValue: "Configured permissions",
  },
  {
    id: 6,
    label: "Analytics",
    badge: "06 / BUSINESS INTELLIGENCE",
    title: "Operational Visibility & Financial Control",
    description: "Configured reports support review of ledger activity, turnaround times and inventory.",
    status: "Example report",
    metricLabel: "Reporting scope",
    metricValue: "Facility configuration",
  },
  {
    id: 7,
    label: "Connected Lab",
    badge: "07 / END-TO-END WORKFLOW",
    title: "From Registration to Results, Finance and Beyond",
    description: "Configurable workflows support clinical, financial, inventory and patient-facing operations.",
    status: "Illustrative workflow",
    metricLabel: "Availability",
    metricValue: "Agreed scope",
  },
];

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotion() {
  return true;
}

export function HeroProductAnimation() {
  const [activeScene, setActiveScene] = useState(0);
  const [playback, setPlayback] = useState<"auto" | "playing" | "paused">("auto");
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotion, getServerReducedMotion);
  const isPlaying = playback === "auto" ? !reducedMotion : playback === "playing";

  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setActiveScene((prev) => (prev + 1) % scenes.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const scene = scenes[activeScene];

  return (
    <div className="hero-cinema" aria-label="Illustrative Prime Laboratory Software workflow demonstration">
      <p className="sr-only" role="status" aria-atomic="true">{!isPlaying ? `Scene ${activeScene + 1} of ${scenes.length}: ${scene.label}` : ""}</p>
      <div className="cinema-header">
        <div className="cinema-brand">
          <span className="cinema-dot" aria-hidden="true" />
          <span className="cinema-brand-title">WORKFLOW PREVIEW</span>
          <span className="cinema-tag">ILLUSTRATIVE</span>
        </div>
        <div className="cinema-controls">
          <button
            type="button"
            className="cinema-control-btn"
            aria-label={isPlaying ? "Pause automated workflow animation" : "Play automated workflow animation"}
            aria-pressed={isPlaying}
            onClick={() => setPlayback(isPlaying ? "paused" : "playing")}
          >
            {isPlaying ? (
              <span className="cinema-icon" aria-hidden="true">⏸</span>
            ) : (
              <span className="cinema-icon" aria-hidden="true">▶</span>
            )}
            <span className="cinema-btn-text">{isPlaying ? "Pause" : "Play"}</span>
          </button>
        </div>
      </div>

      <div className="cinema-viewport" role="region" aria-label="Workflow preview" onFocusCapture={() => setPlayback("paused")}>
        <p className="cinema-disclaimer">Illustrative interface and sample data, not a live product screen.</p>
        <div className="cinema-scene-card">
          <div className="cinema-meta">
            <span className="cinema-badge">{scene.badge}</span>
            <span className="cinema-live-status">
              <span className="pulse-indicator" aria-hidden="true" />
              {scene.status}
            </span>
          </div>

          <h3 className="cinema-title">{scene.title}</h3>
          <p className="cinema-desc">{scene.description}</p>

          <div className="cinema-visual-stage">
            {activeScene === 0 && (
              <div className="stage-scene stage-scene-intro">
                <div className="stage-logo-wrap">
                  <div className="stage-logo-icon">
                    <span className="bar bar-1" />
                    <span className="bar bar-2" />
                    <span className="bar bar-3" />
                  </div>
                  <div className="stage-logo-text">
                    <strong>prime</strong>
                    <small>LABORATORY SOFTWARE</small>
                  </div>
                </div>
                <div className="stage-nodes">
                  <span className="node active">Front Desk</span>
                  <span className="node-arrow">→</span>
                  <span className="node active">Phlebotomy</span>
                  <span className="node-arrow">→</span>
                  <span className="node active">Laboratory</span>
                  <span className="node-arrow">→</span>
                  <span className="node active">Accounting</span>
                </div>
              </div>
            )}

            {activeScene === 1 && (
              <div className="stage-scene stage-scene-intake">
                <div className="patient-card">
                  <div className="patient-avatar">EX</div>
                  <div className="patient-details">
                    <strong>Example patient</strong>
                    <span>Illustrative record · SYN-PAT-1082</span>
                  </div>
                  <span className="status-pill status-ready">Registered</span>
                </div>
                <div className="test-selection-list">
                  <div className="test-item">
                    <span>Full Blood Count (FBC) + Diff</span>
                    <b>Hematology</b>
                  </div>
                  <div className="test-item">
                    <span>Lipid Panel Comprehensive</span>
                    <b>Biochemistry</b>
                  </div>
                </div>
              </div>
            )}

            {activeScene === 2 && (
              <div className="stage-scene stage-scene-billing">
                <div className="barcode-panel">
                  <div className="barcode-graphic" aria-hidden="true">
                    <span className="bar-line b-wide" />
                    <span className="bar-line b-thin" />
                    <span className="bar-line b-med" />
                    <span className="bar-line b-thin" />
                    <span className="bar-line b-wide" />
                    <span className="bar-line b-med" />
                    <span className="bar-line b-thin" />
                  </div>
                  <div className="barcode-info">
                    <strong>BAR-8821-EDTA</strong>
                    <small>Specimen: Whole Blood (Lavender Tube)</small>
                  </div>
                  <span className="status-pill status-collected">Collected</span>
                </div>
                <div className="invoice-summary">
                  <div className="invoice-row">
                    <span>Billing tariff: example</span>
                    <b>GHS 185.00</b>
                  </div>
                  <div className="invoice-row verified">
                    <span>Payment: illustrative status</span>
                    <strong className="text-green">✓ Example paid</strong>
                  </div>
                </div>
              </div>
            )}

            {activeScene === 3 && (
              <div className="stage-scene stage-scene-analyzer">
                <div className="analyzer-bridge">
                  <div className="device-block">
                    <span className="device-icon">🔬</span>
                    <strong>Laboratory analyzer</strong>
                    <small>Compatibility to validate</small>
                  </div>
                  <div className="data-transfer">
                    <span className="data-pulse" />
                    <span className="data-label">Configured mapping</span>
                  </div>
                  <div className="device-block dest">
                    <span className="device-icon">💻</span>
                    <strong>PLS Workbench</strong>
                    <small>Result Processing</small>
                  </div>
                </div>
                <div className="stream-ticker">
                  <code>Illustrative result data · Device compatibility varies</code>
                </div>
              </div>
            )}

            {activeScene === 4 && (
              <div className="stage-scene stage-scene-results">
                <div className="results-table">
                  <div className="result-row head">
                    <span>PARAMETER</span>
                    <span>OBSERVED</span>
                    <span>REFERENCE</span>
                    <span>FLAG</span>
                  </div>
                  <div className="result-row">
                    <span>Hemoglobin</span>
                    <b>14.2 g/dL</b>
                    <small>13.0 - 17.5</small>
                    <span className="badge-normal">Normal</span>
                  </div>
                  <div className="result-row">
                    <span>Total Cholesterol</span>
                    <b>188 mg/dL</b>
                    <small>&lt; 200</small>
                    <span className="badge-normal">Normal</span>
                  </div>
                  <div className="result-row highlight">
                    <span>Platelet Count</span>
                    <b>245 x10^9/L</b>
                    <small>150 - 450</small>
                    <span className="badge-normal">Normal</span>
                  </div>
                </div>
                <div className="signoff-banner">
                  <span className="seal">✓</span>
                  <span>Example authorization by a permitted reviewer</span>
                </div>
              </div>
            )}

            {activeScene === 5 && (
              <div className="stage-scene stage-scene-finance">
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <small>Daily Collections</small>
                    <strong>Example data</strong>
                    <span className="trend">Illustrative only</span>
                  </div>
                  <div className="kpi-card">
                    <small>Tests Completed</small>
                    <strong>Example orders</strong>
                    <span className="trend">For demonstration</span>
                  </div>
                </div>
                <div className="subledger-row">
                  <span className="ledger-tag">GENERAL LEDGER</span>
                  <span>Example journal entry</span>
                  <strong className="status-closed">For review</strong>
                </div>
              </div>
            )}

            {activeScene === 6 && (
              <div className="stage-scene stage-scene-complete">
                <div className="complete-hero">
                  <h4>The Full Laboratory System</h4>
                  <p>Clinical, financial, inventory, and patient journeys unified in one dependable software.</p>
                </div>
                <div className="complete-actions">
                  <Link href="/product-tour" className="btn-cinema-tour">
                    Open Full Screenshot Library →
                  </Link>
                  <Link href="/request-demo" className="btn-cinema-demo">
                    Schedule Facility Walkthrough ↗
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="cinema-footer">
            <div className="cinema-metric">
              <span className="metric-label">{scene.metricLabel}:</span>
              <strong className="metric-value">{scene.metricValue}</strong>
            </div>
            <div className="cinema-nav-dots" role="group" aria-label="Select animation scene">
              {scenes.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`cinema-dot-btn ${activeScene === index ? "active" : ""}`}
                  aria-pressed={activeScene === index}
                  aria-label={`Jump to scene ${index + 1}: ${item.label}`}
                  onClick={() => {
                    setActiveScene(index);
                    setPlayback("paused");
                  }}
                >
                  <span className="dot-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
