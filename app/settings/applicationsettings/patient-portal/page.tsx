"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PatientPortalSettingsManager from '../../../../components/PatientPortal/PatientPortalSettingsManager';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { roleAllowed } from '../../../../components/Auth/roles';

export default function PatientPortalSettingsPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const role = String(applicationsettings?.user?.role || '');
     const canManage = roleAllowed(role, ['admin', 'manager']);

     useEffect(() => {
          if (role && !canManage) router.replace('/unauthorized');
     }, [canManage, role, router]);

     if (!canManage) return null;
     return <PatientPortalSettingsManager />;
}
