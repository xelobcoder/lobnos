export type FitAnswers = {
  facility: "single-lab" | "hospital-centre" | "multi-site";
  priority: "lab-workflow" | "revenue-oversight" | "inventory-quality" | "integrations-growth";
  connectivity: "standalone" | "analyzers" | "external-systems" | "multi-site-network";
};

export type FitRecommendation = {
  title: string;
  summary: string;
  areas: string[];
  focus: string;
};

export function getFitRecommendation(answers: FitAnswers): FitRecommendation {
  if (answers.facility === "multi-site" || answers.connectivity === "multi-site-network") {
    return {
      title: "Connected multi-site planning",
      summary: "Start with shared workflow standards, access boundaries and cross-facility oversight, then assess each site’s interfaces and operating differences.",
      areas: ["Shared patient and specimen workflow", "Multi-facility access and reporting", "Site-by-site integration assessment"],
      focus: "Connected multi-site planning",
    };
  }

  if (answers.priority === "integrations-growth" || answers.connectivity === "analyzers" || answers.connectivity === "external-systems") {
    return {
      title: "Integration-ready workflow planning",
      summary: "Begin with the laboratory workflow, then map the devices or external systems that need assessed interfaces before configuration.",
      areas: ["Test configuration and registration-to-report workflow", "Analyzer result reception and parameter-mapping assessment", "Validation and launch readiness"],
      focus: "Integration-ready workflow planning",
    };
  }

  if (answers.priority === "revenue-oversight") {
    return {
      title: "Operational and financial oversight",
      summary: "Start with the patient-to-payment path so operational activity, charges, collections and management review can be considered together.",
      areas: ["Clinician, organization and time-based tariffs", "Collections, receivables and referral commissions", "General ledger and management reporting"],
      focus: "Operational and financial oversight",
    };
  }

  if (answers.priority === "inventory-quality") {
    return {
      title: "Operations and governance foundation",
      summary: "Start with the core laboratory workflow and the supporting stock, quality and audit records your team needs to manage consistently.",
      areas: ["Specimen and result workflow", "Inventory and supplier records", "Quality, calibration and audit controls"],
      focus: "Operations and governance foundation",
    };
  }

  return {
    title: "Core laboratory workflow foundation",
    summary: "Start with a clear registration-to-report path, role boundaries and the operational records needed for a controlled first launch.",
    areas: ["Patient, clinician and organization registration", "Test templates, specimens and result review", "Audit history, reporting and launch readiness"],
    focus: "Core laboratory workflow foundation",
  };
}
