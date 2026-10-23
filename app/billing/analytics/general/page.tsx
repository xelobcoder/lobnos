import React from 'react'
import TotalSalesByBranch from '../../../../components/Billing/analytics/TotalSalesByBranch'
import SalesByHourOfDay from '../../../../components/Billing/analytics/SalesByHourOfDay'
import WeeklySalesTrend from '../../../../components/Billing/analytics/weeklySalesTrend'


export default function GenaralBillingAnalytics() {
    return (
        <div>
            <div className='d-flex'>
                <div className='col-6'>
                    <TotalSalesByBranch />
                </div>
                <div className='col-6'>
                    <WeeklySalesTrend />
                </div>
            </div>
            <div className='col-12'>
                <SalesByHourOfDay />
            </div>
        </div>
    )
}
