"use client"
import { useEffect, useState } from "react";
import { customFetch } from "../Auth/customFetch";
import {
    RiTimeLine,
    RiCheckDoubleLine,
    RiCloseCircleLine,
    RiRefreshLine,
    RiTestTubeLine
} from '@remixicon/react';

const defaultValues = { rejected: 0, orders: 0, completed: 0, collected: 0, pending: 0, allTimePending: 0 };

export default function PhelobotomySummaryAnalytics() {
    const [data, setData] = useState(defaultValues);

    useEffect(() => {
        let isMounted = true;
        const fetchSummary = async () => {
            try {
                const response = await customFetch(`ascension/phelobotomistAnalyticsSummary`);
                if (isMounted) setData(response);
            } catch (err) {
                if (isMounted) setData(defaultValues);
            }
        };
        fetchSummary();
        return () => { isMounted = false; };
    }, []);

    const cards = [
        {
            label: "Pending Requests (24h)",
            value: data.pending || 0,
            subtitle: "Requests awaiting collection",
            icon: RiTimeLine,
            variant: "warning"
        },
        {
            label: "Collected Containers (24h)",
            value: data.collected || 0,
            subtitle: "Containers collected",
            icon: RiCheckDoubleLine,
            variant: "success"
        },
        {
            label: "Rejected Containers (24h)",
            value: data.rejected || 0,
            subtitle: "Containers rejected",
            icon: RiCloseCircleLine,
            variant: "danger"
        },
        {
            label: "Review-Upheld Recollections (24h)",
            value: data.orders || 0,
            subtitle: "Recollections upheld after review",
            icon: RiRefreshLine,
            variant: "info"
        },
        {
            label: "Redraws Collected (24h)",
            value: data.completed || 0,
            subtitle: "Redraw containers collected",
            icon: RiTestTubeLine,
            variant: "primary"
        },
        {
            label: "All-Time Pending Requests",
            value: data.allTimePending || 0,
            subtitle: "Requests awaiting collection",
            icon: RiTimeLine,
            variant: "secondary"
        }
    ];

    return (
        <div className="p-3 border rounded-3 bg-body">
            <div className="mb-3">
                <h5 className="mb-1 fw-bold text-body d-flex align-items-center gap-2">
                    <RiTestTubeLine className="text-primary" size={24} />
                    Phelobotomy Summary
                </h5>
                <p className="text-muted small mb-0">
                    Collection activity and pending requests for the last 24 hours.
                </p>
            </div>
            <div className="row g-3">
                {cards.map((card, idx) => (
                    <div key={idx} className="col-12 col-md-6 col-lg-3">
                        <div className={`card border-0 shadow-sm bg-${card.variant} bg-gradient text-white rounded-3 h-100`}>
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="text-xs text-uppercase fw-semibold opacity-75">{card.label}</span>
                                    <card.icon size={22} className="opacity-75" />
                                </div>
                                <h3 className="fw-bold mb-0">{Number(card.value).toLocaleString()}</h3>
                                <span className="text-xs opacity-75">{card.subtitle}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}