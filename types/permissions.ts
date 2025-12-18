// Type definitions for LIMS permissions system
export interface PageAccess {
     registration: boolean;
     inventory: boolean;
     activation: boolean;
     suppliers: boolean;
     operations: boolean;
     approvals: boolean;
     settings: boolean;
     payments: boolean;
     billing: boolean;
     phelobotomy: boolean;
     samples: boolean;
     organization: boolean;
     clinician: boolean;
     appointment: boolean;
     laboratory: boolean;
     imaging: boolean;
     crm: boolean;
     analytics: boolean;
     compliance: boolean;
}

export interface LabPermissions {
     // Role identifier
     role: string;

     // CRUD permissions for different resources
     patients: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          history: boolean;
     };

     samples: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          history: boolean;
     };

     orders: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          history: boolean;
     };

     results: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          history: boolean;
     };

     qualityControl: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          history: boolean;
     };

     billing: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          history: boolean;
     };

     inventory: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          history: boolean;
     };

     compliance: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          history: boolean;
     };

     administration: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          history: boolean;
     };

     pageAccess: PageAccess;
}
export type LabRole = 'admin' | 'manager' | 'labscientist' | 'sonographer' | 'phelobotomist' | 'customer service representative';

// Permission keys for dynamic access
export type PermissionKey = keyof Omit<LabPermissions, 'role' | 'pageAccess'>;
export type PageAccessKey = keyof PageAccess;