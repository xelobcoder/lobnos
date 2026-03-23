"use client";
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import PhelobotomyMainPageClientModule from '../../../../components/phelobotomy/ReceiveLabSampleModal/PhelobotomyMainPageClientModule';
import { Container, Alert, Button, Spinner, Card, Offcanvas } from 'react-bootstrap';
import { RiTestTubeLine, RiCalendarEventLine, RiSearchLine, RiRefreshLine, RiFilterOffLine, RiFilterLine } from '@remixicon/react';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import { handleDateRangeSelection } from '../../../../components/operations/Laboratory/AscensionFilteringComponent';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

export default function PagePhelobotomy() {
    const [data, setData] = useState<any[]>([]);
    const [filter, setFilter] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const url_start_date = useSearchParams()?.get('start_date') || '';
    const url_end_date = useSearchParams()?.get('end_date') || '';
    const billingid = useSearchParams()?.get('billingid') || '';

    const [selectedDate, setSelectedDate] = useState({
        _dateFrom: url_start_date || dayjs(new Date().toISOString()).format("YYYY-MM-DD"),
        _dateEnd: url_end_date || dayjs(new Date().toISOString()).format("YYYY-MM-DD")
    });
    const [showFilters, setShowFilters] = useState(false);
    const [dateFilter, setDateFilter] = useState('');

    const handleLoad = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = billingid ? `test/ascension/pendingCases?billingid=${billingid}&&count=10&&page=1` : `test/ascension/pendingCases?filter=${filter}&&count=10&&page=1&&start_date=${selectedDate._dateFrom}&end_date=${selectedDate._dateEnd}`;
            const { result } = await customFetch(url);
            setData(Array.isArray(result) && result.length > 0 ? result : []);
        } catch (err) {
            setError("Failed to load pending cases. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleLoad();
    }, []);

    const handleClearFilters = () => {
        setFilter('');
        setSelectedDate({
            _dateFrom: '',
            _dateEnd: ''
        });
    };

    return (
        <div className="container-fluid px-4 py-3">
            <div className="row g-3 align-items-end mb-4">
                <div className="col-12 col-md-auto" style={{ minWidth: '200px' }}>
                    <DateFilterReusable
                        value={dateFilter}
                        onChange={setDateFilter}
                        onDateRangeChange={(startDate, endDate) => {
                            setSelectedDate({
                                _dateFrom: startDate,
                                _dateEnd: endDate
                            });
                        }}
                        label="Filter by"
                        className="w-100"
                    />
                </div>
                <div className="col-12 col-md-auto">
                    <label htmlFor="start-date" className="form-label fw-medium" style={{ color: COLOR_TEXT_MUTED }}>
                        <RiCalendarEventLine size={16} className="me-1" />
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="start-date"
                        className="form-control shadow-none"
                        style={{ borderColor: COLOR_BORDER }}
                        value={selectedDate._dateFrom}
                        onChange={e => setSelectedDate({ ...selectedDate, _dateFrom: e.target.value })}
                    />
                </div>
                <div className="col-12 col-md-auto">
                    <label htmlFor="end-date" className="form-label fw-medium" style={{ color: COLOR_TEXT_MUTED }}>
                        <RiCalendarEventLine size={16} className="me-1" />
                        End Date
                    </label>
                    <input
                        type="date"
                        id="end-date"
                        className="form-control shadow-none"
                        style={{ borderColor: COLOR_BORDER }}
                        value={selectedDate._dateEnd}
                        onChange={e => setSelectedDate({ ...selectedDate, _dateEnd: e.target.value })}
                    />
                </div>
                <div className="col-12 col-md">
                    <label htmlFor="search-filter" className="form-label fw-medium" style={{ color: COLOR_TEXT_MUTED }}>
                        <RiSearchLine size={16} className="me-1" />
                        Search Filter
                    </label>
                    <input
                        id="search-filter"
                        className="form-control shadow-none"
                        style={{ borderColor: COLOR_BORDER }}
                        onChange={(e) => setFilter(e.target.value)}
                        value={filter}
                        type="text"
                        placeholder="Search by Patient Name, Case ID, or Billing ID"
                    />
                </div>
                <div className="col-12 col-md-auto d-flex gap-2">
                    <Button
                        onClick={() => {
                            handleLoad();
                            setShowFilters(false);
                        }}
                        disabled={loading}
                        className="d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                    >
                        {loading ? (
                            <Spinner size="sm" animation="border" className="me-1" />
                        ) : (
                            <RiRefreshLine size={16} className="me-1" />
                        )}
                        Load Samples
                    </Button>
                    <Button
                        onClick={handleClearFilters}
                        variant="outline-secondary"
                        disabled={loading}
                        className="d-flex align-items-center justify-content-center"
                        title="Clear all filters"
                    >
                        <RiFilterOffLine size={16} />
                    </Button>
                </div>
            </div>


            {/* Error Alert */}
            {error && (
                <Alert
                    dismissible
                    variant="danger"
                    className="mb-4 d-flex align-items-center"
                    onClose={() => setError(null)}
                    style={{ borderRadius: '0.5rem' }}
                >
                    <RiTestTubeLine size={18} className="me-2 flex-shrink-0" />
                    <div>
                        <strong>Load Error</strong>
                        <div className="mt-1">{error}</div>
                    </div>
                </Alert>
            )}

            {/* Main Content */}
            <PhelobotomyMainPageClientModule data={data} filter={{ filter, ...selectedDate }} />
        </div>
    );
}