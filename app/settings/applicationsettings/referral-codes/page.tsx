"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReferralCodesManager from '../../../../components/ReferralCodes/ReferralCodesManager';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { roleAllowed } from '../../../../components/Auth/roles';

export default function ReferralCodesPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const role = String(applicationsettings?.user?.role || '').toLowerCase().trim().replace(/[_-]+/g, ' ');
     const canManage = roleAllowed(role, ['admin']);

     useEffect(() => {
          if (role && !canManage) router.replace('/crm/referral-codes');
     }, [canManage, role, router]);

     if (!canManage) return null;
     return <ReferralCodesManager />;
}