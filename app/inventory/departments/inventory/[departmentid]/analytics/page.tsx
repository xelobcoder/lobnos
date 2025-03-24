import React from 'react';

type InventoryDepartmentAnalyticsPageProps = {
    params: Promise<{
        departmentid: number;
    }>;
};

export default async function InventoryDepartmentAnalyticsPage({ params }: InventoryDepartmentAnalyticsPageProps) {
    const { departmentid } = await params;
    return (
        <div>
            <h1>{departmentid}</h1>
        </div>
    );
}
