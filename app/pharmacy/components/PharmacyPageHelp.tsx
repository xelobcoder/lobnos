'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { pharmacyGuideForPath } from '../../../lib/pharmacyManual';
import { articleHref } from '../../../lib/pharmacyLearning';
import { canAccessRolePage } from '../../../lib/roleNavigationPolicy';
import { usePharmacyAccess } from './PharmacyWorkspace';

export default function PharmacyPageHelp() {
  const path = usePathname(), { app } = usePharmacyAccess();
  const page = pharmacyGuideForPath(path);
  if (!page || path.startsWith('/pharmacy/accounting') || !canAccessRolePage(app?.user?.role, path)) return null;
  return <nav aria-label="Page help" className="d-print-none px-3 pt-3">
    <Link href={articleHref(page.slug)}>How to use this page: {page.title}</Link>
  </nav>;
}
