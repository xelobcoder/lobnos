'use client';

import {useState} from 'react';
import ui from '../Billing/billing-strategy/StrategyWorkspace.module.css';

export function stockTablePage<T>(rows: readonly T[], page: number, size: number) {
    if (!Number.isSafeInteger(size) || size < 1 || !Number.isSafeInteger(page)) throw new Error('Invalid stock table pagination');
    const pages = Math.max(1, Math.ceil(rows.length / size));
    const current = Math.min(Math.max(1, page), pages);
    const start = rows.length ? (current - 1) * size + 1 : 0;
    return {rows: rows.slice((current - 1) * size, current * size), page: current, pages, size, total: rows.length, start, end: Math.min(current * size, rows.length)};
}

export function useStockTablePagination<T>(rows: readonly T[], scope: string, searchText?: (row: T) => string) {
    const [position, setPosition] = useState({scope, page: 1});
    const [size, setSize] = useState(10);
    const [filter, setFilter] = useState({scope, value: ''});
    const query = filter.scope === scope ? filter.value : '';
    const filtered = searchText && query.trim()
        ? rows.filter(row => searchText(row).toLowerCase().includes(query.trim().toLowerCase()))
        : rows;
    return {
        ...stockTablePage(filtered, position.scope === scope ? position.page : 1, size),
        query, searchable: !!searchText,
        setPage: (page: number) => setPosition({scope, page}),
        setSize: (value: number) => { setSize(value); setPosition({scope, page: 1}); },
        setQuery: (value: string) => { setFilter({scope, value}); setPosition({scope, page: 1}); },
    };
}

type Controls = Omit<ReturnType<typeof useStockTablePagination>, 'rows'>;

export default function StockTablePagination({table, label, disabled = false}: {table: Controls; label: string; disabled?: boolean}) {
    return (
        <div className={ui.footer}>
            <div className={ui.actions}>
                {table.searchable && <label className={ui.field}>
                    <span>Search {label}</span>
                    <input type="search" aria-label={`Search ${label}`} value={table.query} disabled={disabled} onChange={event => table.setQuery(event.target.value)} />
                </label>}
                <label className={ui.field}>
                    <span>Rows per page</span>
                    <select aria-label={`${label} rows per page`} value={table.size} disabled={disabled} onChange={event => table.setSize(Number(event.target.value))}>
                        {[10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </label>
            </div>
            <nav className={ui.pager} aria-label={`${label} pagination`}>
                <span role="status" aria-live="polite">{table.start}-{table.end} of {table.total} / Page {table.page} of {table.pages}</span>
                <button className={ui.secondary} type="button" disabled={disabled || table.page === 1} onClick={() => table.setPage(table.page - 1)}>Previous</button>
                <button className={ui.secondary} type="button" disabled={disabled || table.page === table.pages} onClick={() => table.setPage(table.page + 1)}>Next</button>
            </nav>
        </div>
    );
}
