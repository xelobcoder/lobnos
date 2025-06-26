"use client"
import React, { useEffect, useState } from 'react'
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext'
import { useRouter } from 'next/navigation';

export default function RefundManagement() {
    const [loading, setLoading] = useState(true);
    const { user } = useApplicationSettings().applicationsettings;
    const router = useRouter();
    const employeeid = user?.employeeid;
    const role = user?.role;

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) return <h5 className='alert alert-info text-sm'>Authenticating..................</h5>



    if (role === 'admin') {
        return router.push(`refund/refundAdmin/${employeeid}`)
    } else {
        return router.push(`refund/${employeeid}`)
    }
}
