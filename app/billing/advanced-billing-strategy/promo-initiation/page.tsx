"use client"
import React from 'react'
import BillingPromoCodeForm from '../../../../components/Billing/billing-strategy/BillingPromoCodeForm'

export default function page() {
    const onSubmit = async () => {
        console.log('value');
    }
    return (
        <div>
            <h4>Promo Code</h4>
            <BillingPromoCodeForm onSubmit={onSubmit} />
        </div>
    )
}
