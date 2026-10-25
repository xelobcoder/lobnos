'use client';
import { use } from 'react';
import PackageDetails from '../../../../components/Billing/packages/PackageDetails';
export default function Page({params}:{params:Promise<{packageid:string}>}){const {packageid}=use(params);return <PackageDetails packageId={packageid}/>;}
