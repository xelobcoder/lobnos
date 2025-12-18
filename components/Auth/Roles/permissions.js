// Modern LIMS-specific permissions structure
// Organized by functional areas rather than generic CRUD operations

// Phelobotomist: Sample collection and basic patient services
export const phelobotomy = {
  role: 'phelobotomist',

  // Patient Management
  registerPatient: true,
  viewPatient: true,
  editPatientBasic: true,
  viewPatientHistory: false,

  // Sample Management
  collectSamples: true,
  labelSamples: true,
  trackSampleStatus: true,
  handleSampleRejection: true,

  // Order Management
  viewOrders: true,
  createOrders: false,
  editOrders: false,

  // Results
  viewOwnResults: false,
  enterResults: false,
  editResults: false,

  // Billing
  viewBilling: false,
  processPayments: false,

  // Inventory
  viewInventory: false,
  requestSupplies: true,

  // Quality & Compliance
  reportIncidents: true,
  viewAuditLogs: false,

  // Administrative
  manageUsers: false,
  systemConfig: false,
  viewAnalytics: false,

  pageAccess: {
    registration: true,
    inventory: false,
    activation: false,
    suppliers: false,
    operations: false,
    approvals: false,
    settings: false,
    payments: false,
    billing: false,
    phelobotomy: true,
    samples: true,
    organization: false,
    clinician: false,
    appointment: true,
    laboratory: false,
    imaging: false,
    crm: false,
    analytics: false,
    compliance: true,
  }
}

// Customer Service Representative: Patient coordination and billing support
export const customerRepresentative = {
  role: 'customer service representative',

  // Patient Management
  registerPatient: true,
  viewPatient: true,
  editPatientBasic: true,
  viewPatientHistory: true,

  // Sample Management
  collectSamples: false,
  labelSamples: false,
  trackSampleStatus: true,
  handleSampleRejection: false,

  // Order Management
  viewOrders: true,
  createOrders: true,
  editOrders: true,

  // Results
  viewOwnResults: false,
  enterResults: false,
  editResults: false,

  // Billing
  viewBilling: true,
  processPayments: true,
  manageInvoices: true,
  handleInsurance: true,

  // Inventory
  viewInventory: false,
  requestSupplies: false,

  // Quality & Compliance
  reportIncidents: true,
  viewAuditLogs: false,

  // Administrative
  manageUsers: false,
  systemConfig: false,
  viewAnalytics: false,

  pageAccess: {
    registration: true,
    inventory: false,
    activation: true,
    suppliers: false,
    operations: false,
    approvals: false,
    settings: false,
    payments: true,
    billing: true,
    phelobotomy: false,
    samples: false,
    organization: false,
    clinician: false,
    appointment: true,
    laboratory: false,
    imaging: false,
    crm: true,
    analytics: false,
    compliance: true,
  }
}

// Scientist (Lab Scientist): Laboratory testing and result management
export const scientistPermission = {
  role: 'labscientist',

  // Patient Management
  registerPatient: false,
  viewPatient: true,
  editPatientBasic: false,
  viewPatientHistory: false,

  // Sample Management
  collectSamples: false,
  labelSamples: false,
  trackSampleStatus: true,
  handleSampleRejection: false,
  processSamples: true,
  manageSampleStorage: false,

  // Order Management
  viewOrders: true,
  createOrders: false,
  editOrders: false,

  // Results
  viewOwnResults: true,
  enterResults: true,
  editResults: true,
  validateResults: true,
  approveResults: false,
  handleCriticalValues: true,

  // Quality Control
  performQC: true,
  reviewQC: false,
  manageInstruments: false,

  // Billing
  viewBilling: false,
  processPayments: false,

  // Inventory
  viewInventory: true,
  requestSupplies: true,
  manageReagents: false,

  // Quality & Compliance
  reportIncidents: true,
  viewAuditLogs: false,
  manageQualityControls: false,

  // Administrative
  manageUsers: false,
  systemConfig: false,
  viewAnalytics: false,

  pageAccess: {
    registration: false,
    inventory: true,
    activation: false,
    suppliers: false,
    operations: true,
    approvals: false,
    settings: false,
    payments: false,
    billing: false,
    phelobotomy: false,
    samples: true,
    organization: false,
    clinician: false,
    appointment: false,
    laboratory: true,
    imaging: false,
    crm: false,
    analytics: false,
    compliance: false,
  }
}

// Sonographer: Imaging operations and ultrasound management
export const sonographerPermission = {
  role: 'sonographer',

  // Patient Management
  registerPatient: false,
  viewPatient: true,
  editPatientBasic: false,
  viewPatientHistory: true,

  // Sample Management (for imaging, this might be minimal)
  collectSamples: false,
  labelSamples: false,
  trackSampleStatus: false,
  handleSampleRejection: false,

  // Order Management
  viewOrders: true,
  createOrders: false,
  editOrders: false,

  // Imaging Results
  viewImagingResults: true,
  enterImagingResults: true,
  editImagingResults: true,
  validateImagingResults: true,
  approveImagingResults: false,

  // Equipment Management
  manageUltrasoundEquipment: true,
  performMaintenance: true,

  // Quality Control
  performImagingQC: true,
  reviewImagingQC: true,

  // Billing
  viewBilling: false,
  processPayments: false,

  // Inventory
  viewInventory: true,
  requestSupplies: true,

  // Quality & Compliance
  reportIncidents: true,
  viewAuditLogs: true,

  // Administrative
  manageUsers: false,
  systemConfig: false,
  viewAnalytics: false,

  pageAccess: {
    registration: false,
    inventory: true,
    activation: false,
    suppliers: false,
    operations: true,
    approvals: true,
    settings: false,
    payments: false,
    billing: false,
    phelobotomy: false,
    samples: false,
    organization: false,
    clinician: false,
    appointment: true,
    laboratory: false,
    imaging: true,
    crm: false,
    analytics: false,
    compliance: true,
  }
}

// Manager: Supervisory role with oversight and management capabilities
export const managerPermission = {
  role: 'manager',

  // Patient Management
  registerPatient: true,
  viewPatient: true,
  editPatientBasic: true,
  viewPatientHistory: true,

  // Sample Management
  collectSamples: false,
  labelSamples: false,
  trackSampleStatus: true,
  handleSampleRejection: true,
  processSamples: false,
  manageSampleStorage: true,

  // Order Management
  viewOrders: true,
  createOrders: true,
  editOrders: true,
  manageOrderWorkflow: true,

  // Results
  viewOwnResults: true,
  enterResults: false,
  editResults: false,
  validateResults: true,
  approveResults: true,
  handleCriticalValues: true,
  overrideResults: true,

  // Quality Control
  performQC: false,
  reviewQC: true,
  manageInstruments: true,
  approveQC: true,

  // Billing
  viewBilling: true,
  processPayments: true,
  manageInvoices: true,
  handleInsurance: true,
  managePricing: true,
  viewFinancialReports: true,

  // Inventory
  viewInventory: true,
  requestSupplies: true,
  manageStockLevels: true,
  manageSuppliers: true,

  // Quality & Compliance
  reportIncidents: true,
  viewAuditLogs: true,
  manageQualityControls: true,
  handleCompliance: true,
  manageIncidents: true,

  // Administrative
  manageUsers: true,
  systemConfig: true,
  viewAnalytics: true,
  generateReports: true,

  pageAccess: {
    registration: true,
    inventory: true,
    activation: true,
    suppliers: true,
    operations: true,
    approvals: true,
    settings: true,
    payments: true,
    billing: true,
    phelobotomy: true,
    samples: true,
    organization: true,
    clinician: true,
    appointment: true,
    laboratory: true,
    imaging: true,
    crm: true,
    analytics: true,
    compliance: true,
  }
}

// Administrator: Full system access with all capabilities
export const administrator = {
  role: 'admin',

  // All permissions enabled
  registerPatient: true,
  viewPatient: true,
  editPatientBasic: true,
  viewPatientHistory: true,

  collectSamples: true,
  labelSamples: true,
  trackSampleStatus: true,
  handleSampleRejection: true,
  processSamples: true,
  manageSampleStorage: true,

  viewOrders: true,
  createOrders: true,
  editOrders: true,
  manageOrderWorkflow: true,

  viewOwnResults: true,
  enterResults: true,
  editResults: true,
  validateResults: true,
  approveResults: true,
  handleCriticalValues: true,
  overrideResults: true,

  performQC: true,
  reviewQC: true,
  manageInstruments: true,
  approveQC: true,

  viewBilling: true,
  processPayments: true,
  manageInvoices: true,
  handleInsurance: true,
  managePricing: true,
  viewFinancialReports: true,

  viewInventory: true,
  requestSupplies: true,
  manageStockLevels: true,
  manageSuppliers: true,
  manageReagents: true,

  reportIncidents: true,
  viewAuditLogs: true,
  manageQualityControls: true,
  handleCompliance: true,
  manageIncidents: true,

  manageUsers: true,
  systemConfig: true,
  viewAnalytics: true,
  generateReports: true,

  // All page access
  pageAccess: {
    registration: true,
    inventory: true,
    activation: true,
    suppliers: true,
    operations: true,
    approvals: true,
    settings: true,
    payments: true,
    billing: true,
    phelobotomy: true,
    samples: true,
    organization: true,
    clinician: true,
    appointment: true,
    laboratory: true,
    imaging: true,
    crm: true,
    analytics: true,
    compliance: true,
  }
}

export const generalPermission = {}