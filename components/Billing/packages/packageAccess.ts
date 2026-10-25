'use client';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import { roleAllowed } from '../../Auth/roles';
export function usePackageManager() {
    const { applicationsettings } = useApplicationSettings();
    const user = applicationsettings?.user?.user || applicationsettings?.user;
    return roleAllowed(user?.role, ['admin', 'manager']);
}
