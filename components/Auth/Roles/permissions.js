export const pageAccess = {
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
}


export const customerRepresentative = {
  activatev: true,
  deletev: true,
  editv: true,
  role: 'customer service representative',
  registerv: true,
  printv: true,
  viewv: true,
  pageAccess
}



export const scientistPermission = {
  viewv: false,
  editv: false,
  deletev: false,
  registerv: false,
  enterResult:false,
  viewResult:false,
  role: 'scientist',
  printResult:false,
  deleteResult: false,
  pageAccess
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
  pageAccess
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
  pageAccess
}