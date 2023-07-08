export const customerRepresentative = {
  registerClient: true,
  deleteClient: false,
  editClient: true,
  printResult: true,
  activateClient: true,
  viewClient: true,
  enterResult: false,
  viewResult: false,
  printResult: false,
  deleteResult: false,
  pageAccess: {
    registration: true,
    inventory: false,
    activation: true,
    suppliers: false,
    approvals: true,
    settings: false,
    payments: true,
    billing: true,
    phelobotomy: false,
    samples: false,
    organization: true,
    clinician: true,
    appointment: true,
  }
}



export const scientistPermission = {
  viewClient: false,
  editClient: false,
  deleteClient: false,
  registerClient: false,
  enterResult: true,
  viewResult: true,
  printResult: true,
  deleteResult: false,
  pageAccess: {
    registration: true,
    inventory: false,
    activation: true,
    suppliers: false,
    operations: true,
    approvals: true,
    settings: false,
    payments: true,
    billing: true,
    phelobotomy: false,
    samples: false,
    organization: true,
    clinician: true,
    appointment: true,
  }
}



export const Manager = {
  registerClient: true,
  deleteClient: true,
  editClient: true,
  printResult: true,
  activateClient: true,
  viewClient: true,
  enterResult: true,
  viewResult: true,
  printResult: true,
  deleteResult: true,
  pageAccess: {
    registration: true,
    inventory: true,
    activation: true,
    suppliers: true,
    approvals: true,
    settings: true,
    payments: true,
    billing: true,
    phelobotomy: true,
    samples: true,
    operations: true
  }
}



export const administrator = {
  registerClient: true,
  deleteClient: false,
  editClient: true,
  printResult: true,
  activateClient: true,
  viewClient: true,
  enterResult: false,
  viewResult: false,
  printResult: false,
  deleteResult: false,
  pageAccess: {
    registration: true,
    inventory: true,
    activation: true,
    suppliers: true,
    approvals: true,
    settings: true,
    payments: true,
    operations: false,
    billing: true,
    phelobotomy: true,
    samples: true
  }
}