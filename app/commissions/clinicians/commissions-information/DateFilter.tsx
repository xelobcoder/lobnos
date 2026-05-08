"use client";
import React, { useState } from "react";
import dayjs from "dayjs";
import styles from "./CommissionReport.module.css";

interface DateFilterProps {
     startDate: string;
     endDate: string;
     onFilter: (start: string, end: string) => void;
     loading?: boolean;
}

export default function DateFilter({ startDate, endDate, onFilter, loading }: DateFilterProps) {
     const [start, setStart] = useState(startDate);
     const [end, setEnd] = useState(endDate);

     const handleFilter = (e: React.FormEvent) => {
          e.preventDefault();
          if (dayjs(start).isValid() && dayjs(end).isValid()) {
               onFilter(dayjs(start).format("YYYY-MM-DD"), dayjs(end).format("YYYY-MM-DD"));
          }
     };

     return (
          <div className="d-flex flex-row align-items-center gap-2">
               <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                    <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)', paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                         Start
                    </span>
                    <input type="date" className="form-control shadow-none border-start-0" value={start} onChange={e => setStart(e.target.value)} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: 'var(--bs-border-color)', paddingLeft: '0.3rem' }} />
               </div>
               <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                    <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)', paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                         End
                    </span>
                    <input type="date" className="form-control shadow-none border-start-0" value={end} onChange={e => setEnd(e.target.value)} min={start} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: 'var(--bs-border-color)', paddingLeft: '0.3rem' }} />
               </div>
               <button type="submit" className="btn btn-primary btn-sm" onClick={handleFilter} disabled={loading}>
                    {loading ? 'Filtering...' : 'Filter'}
               </button>
          </div>
     );
}
