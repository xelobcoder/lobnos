import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { customFetch, currencyFormatter } from '../../Auth/customFetch';

interface Summary {
    registeredClient: number;
    billedClients: number;
    dayExpenseSum: number;
    salesAmount: number;
    totalCases: number;
    discount: number;
    totalAmountReceived: number;
}

const _default: Summary = {
    registeredClient: 0,
    billedClients: 0,
    dayExpenseSum: 0,
    salesAmount: 0,
    totalCases: 0,
    discount: 0,
    totalAmountReceived: 0,
};

export default async function BilledSummary({ branchid }: { branchid: string }) {
    let summary = _default;

    try {
        const data = await customFetch(`summary/daily?branchid=${branchid}`);
        summary = data;
    } catch (err) {
        toast.error("Something went wrong", { autoClose: 3000, position: "bottom-right" });
        summary = _default
    }

    return (
        <div>
            <section className="row g-4">
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card card-small">
                        <span className="card-header pls-color text-uppercase fw-bold text-white">
                            Billed Clients
                        </span>
                        <div className="card-body p-0">
                            <h5 className="text-center">{summary.billedClients}</h5>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card card-small">
                        <span className="card-header pls-color text-uppercase fw-bold text-white">
                            Total Sales
                        </span>
                        <div className="card-body p-0">
                            <h5 className="text-center">{currencyFormatter.format(summary.salesAmount)}</h5>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card card-small">
                        <span className="card-header pls-color text-uppercase fw-bold text-white">
                            Amount Paid
                        </span>
                        <div className="card-body p-0">
                            <h5 className="text-center">{currencyFormatter.format(summary.totalAmountReceived)}</h5>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card card-small">
                        <span className="card-header pls-color text-uppercase fw-bold text-white">
                            Discount
                        </span>
                        <div className="card-body p-0">
                            <h5 className="text-center">{currencyFormatter.format(summary.discount)}</h5>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card card-small">
                        <span className="card-header pls-color text-uppercase fw-bold text-white">
                            Pending Debts
                        </span>
                        <div className="card-body p-0">
                            <h5 className="text-center text-danger">
                                {currencyFormatter.format(summary.salesAmount - summary.totalAmountReceived)}
                            </h5>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card card-small">
                        <span className="card-header pls-color text-uppercase fw-bold text-white">
                            Expenses Incurred
                        </span>
                        <div className="card-body p-0">
                            <h5 className="text-center text-danger">
                                {currencyFormatter.format(summary.dayExpenseSum > 0 ? summary.dayExpenseSum : 0)}
                            </h5>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}