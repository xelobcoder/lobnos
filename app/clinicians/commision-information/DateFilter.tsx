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
          <form className={styles.dateFilterForm} onSubmit={handleFilter}>
               <label className={styles.dateFilterLabel}>
                    Start Date:
                    <input
                         type="date"
                         value={start}
                         onChange={e => setStart(e.target.value)}
                         className={styles.dateInput}
                         max={end}
                    />
               </label>
               <label className={styles.dateFilterLabel}>
                    End Date:
                    <input
                         type="date"
                         value={end}
                         onChange={e => setEnd(e.target.value)}
                         className={styles.dateInput}
                         min={start}
                    />
               </label>
               <button type="submit" className={styles.filterButton} disabled={loading}>
                    {loading ? "Filtering..." : "Filter"}
               </button>
          </form>
     );
}
