import { LabPermissions, PageAccess } from '../../../types/permissions';

export const phelobotomy: LabPermissions = {
	role: 'phelobotomist',

	patients: {
		create: true,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	samples: {
		create: true,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	orders: {
		create: false,
		read: true,
		update: false,
		delete: false,
		history: true,
	},

	results: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	qualityControl: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	billing: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	inventory: {
		create: false,
		read: false,
		update: true,
		delete: false,
		history: false,
	},

	compliance: {
		create: true,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	administration: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

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
export const customerRepresentative: LabPermissions = {
	role: 'customer service representative',

	patients: {
		create: true,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	samples: {
		create: false,
		read: true,
		update: false,
		delete: false,
		history: true,
	},

	orders: {
		create: true,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	results: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	qualityControl: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	billing: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	inventory: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	compliance: {
		create: true,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	administration: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

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
export const scientistPermission: LabPermissions = {
	role: 'labscientist',

	patients: {
		create: false,
		read: true,
		update: false,
		delete: false,
		history: true,
	},

	samples: {
		create: false,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	orders: {
		create: false,
		read: true,
		update: false,
		delete: false,
		history: true,
	},

	results: {
		create: true,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	qualityControl: {
		create: true,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	billing: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	inventory: {
		create: false,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	compliance: {
		create: true,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	administration: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

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
export const sonographerPermission: LabPermissions = {
	role: 'sonographer',

	patients: {
		create: false,
		read: true,
		update: false,
		delete: false,
		history: true,
	},

	samples: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	orders: {
		create: false,
		read: true,
		update: false,
		delete: false,
		history: true,
	},

	results: {
		create: true,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	qualityControl: {
		create: true,
		read: true,
		update: false,
		delete: false,
		history: true,
	},

	billing: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

	inventory: {
		create: false,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	compliance: {
		create: true,
		read: true,
		update: false,
		delete: false,
		history: true,
	},

	administration: {
		create: false,
		read: false,
		update: false,
		delete: false,
		history: false,
	},

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
export const managerPermission: LabPermissions = {
	role: 'manager',

	patients: {
		create: true,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	samples: {
		create: false,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	orders: {
		create: true,
		read: true,
		update: true,
		delete: false,
		history: true,
	},

	results: {
		create: false,
		read: true,
		update: false,
		delete: false,
		history: true,
	},

	qualityControl: {
		create: false,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	billing: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	inventory: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	compliance: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	administration: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

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
export const administrator: LabPermissions = {
	role: 'admin',

	patients: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	samples: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	orders: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	results: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	qualityControl: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	billing: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	inventory: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	compliance: {
		create: true,
		read: true,
		update: true,
		delete: true,
		history: true,
	},

	administration: {
		create: true,
		read: true,
		update: true,
		delete: true, history: true,
	},

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

export const generalPermission: Partial<LabPermissions> = {}