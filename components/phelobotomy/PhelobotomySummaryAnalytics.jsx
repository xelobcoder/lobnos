"use client"
import { useEffect, useState } from "react";
import { customFetch } from "../Auth/customFetch";
import { 
    RiTimeLine, 
    RiCheckDoubleLine, 
    RiCloseCircleLine, 
    RiRefreshLine 
} from '@remixicon/react';

const defaultValues = { rejected: null, orders: null, completed: null, pending: null };

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

    const iconStyles = [
        { bg: "#1d4ed8", color: "#60a5fa" },
        { bg: "#166534", color: "#22c55e" },
        { bg: "#b91c1c", color: "#f87171" },
        { bg: "#0e7490", color: "#22d3ee" }
    ];

    const cards = [
        {
            label: "Pending Cases (24h)",
            value: data.pending || 0,
            icon: <RiTimeLine size={28} />,
            style: iconStyles[0]
        },
        {
            label: "Collected Cases (24h)",
            value: data.completed || 0,
            icon: <RiCheckDoubleLine size={28} />,
            style: iconStyles[1]
        },
        {
            label: "Rejected Cases (24h)",
            value: data.rejected || 0,
            icon: <RiCloseCircleLine size={28} />,
            style: iconStyles[2]
        },
        {
            label: "Redrawn Completed (24h)",
            value: data.completed || 0,
            icon: <RiRefreshLine size={28} />,
            style: iconStyles[3]
        },
        {
            label:"All Time Pending",
            value: data.allTimePending || 0,
            icon: <RiTimeLine size={28} />,
            style: iconStyles[0]
        }
    ];

    return (
        <div className="py-3">
            <div className="mb-4 pb-2 border-bottom">
                <h4 className="mb-2 fw-bold" style={{ color: '#1E88E5' }}>Phelobotomy Summary</h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    Overview of phelobotomy sample collection, completion, and rejection statistics for the last 24 hours.
                </p>
            </div>
            <div className="row g-3">
                {cards.map((card, idx) => (
                    <div key={idx} className="col-12 col-md-6 col-lg-3">
                        <div 
                            className="card h-100 border-0 shadow-sm"
                            style={{ 
                                borderRadius: '8px',
                                background: card.style.bg,
                                color: 'white',
                                minHeight: 140
                            }}
                        >
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center mb-2">
                                    <div 
                                        className="me-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            background: card.style.color,
                                            color: 'white',
                                            borderRadius: '6px',
                                            width: 40,
                                            height: 40
                                        }}
                                    >
                                        {card.icon}
                                    </div>
                                    <h3 className="h6 mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}>{card.label}</h3>
                                </div>
                                <div>
                                    <span 
                                        className="fw-bold"
                                        style={{ fontSize: '1.8rem', color: 'white' }}
                                    >
                                        {card.value}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}