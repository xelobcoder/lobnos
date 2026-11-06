"use client";

import Link from "next/link";
import { useState } from "react";
import { getFitRecommendation, type FitAnswers } from "../../lib/implementation-fit";

type Question = {
  key: keyof FitAnswers;
  eyebrow: string;
  title: string;
  options: { value: string; label: string; copy: string }[];
};

const questions: Question[] = [
  {
    key: "facility",
    eyebrow: "YOUR SETTING",
    title: "Which setup is closest to yours?",
    options: [
      { value: "single-lab", label: "Single laboratory", copy: "One primary laboratory location." },
      { value: "hospital-centre", label: "Hospital or diagnostic centre", copy: "Laboratory work alongside wider clinical services." },
      { value: "multi-site", label: "Laboratory group", copy: "Multiple locations or shared processing." },
    ],
  },
  {
    key: "priority",
    eyebrow: "YOUR FIRST PRIORITY",
    title: "What should the first conversation focus on?",
    options: [
      { value: "lab-workflow", label: "Laboratory workflow", copy: "Registration, specimens, results and reports." },
      { value: "revenue-oversight", label: "Revenue and oversight", copy: "Billing, collections and management visibility." },
      { value: "inventory-quality", label: "Inventory and governance", copy: "Stock, quality, calibration and audit records." },
      { value: "integrations-growth", label: "Connectivity and growth", copy: "Interfaces, external systems or future expansion." },
    ],
  },
  {
    key: "connectivity",
    eyebrow: "YOUR ENVIRONMENT",
    title: "What needs to connect around the workflow?",
    options: [
      { value: "standalone", label: "Start with the PLS workflow", copy: "No interface is part of the initial discussion." },
      { value: "analyzers", label: "Laboratory analyzers", copy: "One or more devices need interface assessment." },
      { value: "external-systems", label: "External systems", copy: "A clinical, finance or other system may exchange data." },
      { value: "multi-site-network", label: "Multiple sites", copy: "Locations need shared processes and oversight." },
    ],
  },
];

export function ImplementationFitFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<FitAnswers>>({});
  const complete = step === questions.length;
  const question = questions[Math.min(step, questions.length - 1)];
  const recommendation = complete ? getFitRecommendation(answers as FitAnswers) : null;

  function choose(value: string) {
    const next = { ...answers, [question.key]: value };
    setAnswers(next);
    setStep((current) => Math.min(current + 1, questions.length));
  }

  function reset() {
    setAnswers({});
    setStep(0);
  }

  const requestHref = recommendation
    ? `/request-demo?focus=${encodeURIComponent(recommendation.focus)}`
    : "/request-demo";

  return (
    <section className="fit-finder" aria-labelledby="fit-finder-title">
      <div className="fit-finder-copy">
        <span className="eyebrow">A CLEARER PLACE TO START</span>
        <h2 id="fit-finder-title">Find your likely implementation focus.</h2>
        <p>Answer three short questions. We’ll suggest a sensible first conversation—not a fixed package, price or implementation promise.</p>
        <div className="fit-finder-meta">
          <span><b>3</b> questions</span>
          <span><b>No</b> personal details</span>
          <span><b>About</b> 30 seconds</span>
        </div>
      </div>

      <div className="fit-finder-panel">
        <div className="fit-progress" aria-label={`Step ${Math.min(step + 1, questions.length)} of ${questions.length}`}>
          {questions.map((item, index) => <i key={item.key} className={index <= step ? "is-active" : ""} />)}
        </div>
        {!complete ? (
          <div className="fit-question" key={question.key}>
            <span>{question.eyebrow} · {step + 1} OF {questions.length}</span>
            <h3>{question.title}</h3>
            <div className="fit-options">
              {question.options.map((option) => (
                <button type="button" key={option.value} onClick={() => choose(option.value)}>
                  <span><b>{option.label}</b><small>{option.copy}</small></span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
              ))}
            </div>
            {step > 0 && <button className="fit-back" type="button" onClick={() => setStep((current) => current - 1)}>← Previous question</button>}
          </div>
        ) : recommendation ? (
          <div className="fit-result" aria-live="polite">
            <span>YOUR SUGGESTED STARTING POINT</span>
            <h3>{recommendation.title}</h3>
            <p>{recommendation.summary}</p>
            <ul>{recommendation.areas.map((area) => <li key={area}><span>✓</span>{area}</li>)}</ul>
            <div className="fit-result-actions">
              <Link className="button button-dark" href={requestHref}>Discuss this focus <span aria-hidden="true">↗</span></Link>
              <button type="button" onClick={reset}>Start again</button>
            </div>
            <small>Final scope, timing and compatibility are agreed only after requirements assessment.</small>
          </div>
        ) : null}
      </div>
    </section>
  );
}
