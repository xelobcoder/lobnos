'use client';
import { useSearchParams } from 'next/navigation';
import PackageEditor from '../../../../components/Billing/packages/PackageEditor';
export default function Page(){ const params=useSearchParams(); return <PackageEditor packageId={params.get('id')}/>; }
