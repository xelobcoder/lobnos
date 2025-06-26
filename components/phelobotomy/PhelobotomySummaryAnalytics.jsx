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
        { bg: "rgba(33,150,243,0.12)", color: "#2196f3" },
        { bg: "rgba(76,175,80,0.12)", color: "#4caf50" },   
        { bg: "rgba(244,67,54,0.12)", color: "#f44336" },   
        { bg: "rgba(0,188,212,0.12)", color: "#00bcd4" }   
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
                            className="card h-100 border-0 "
                            style={{ 
                                borderRadius: '5px',
                                boxShadow: `0 2px 4px rgba(0,0,0,0.1)`
                            }}
                        >
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center mb-2">
                                    <div 
                                        className="me-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            background: card.style.bg,
                                            color: card.style.color,
                                            borderRadius: '5px',
                                            width: 40,
                                            height: 40
                                        }}
                                    >
                                        {card.icon}
                                    </div>
                                    <h3 className="h6 mb-0">{card.label}</h3>
                                </div>
                                <div>
                                    <span 
                                        className="fw-bold"
                                        style={{ fontSize: '2rem', color: '#222' }}
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