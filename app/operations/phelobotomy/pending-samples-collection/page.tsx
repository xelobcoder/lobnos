"use client";
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import PhelobotomyMainPageClientModule from '../../../../components/phelobotomy/ReceiveLabSampleModal/PhelobotomyMainPageClientModule';
import { Container, Alert, Button, Spinner, Card, Offcanvas } from 'react-bootstrap';
import { RiTestTubeLine, RiCalendarEventLine, RiSearchLine, RiRefreshLine, RiFilterOffLine, RiFilterLine } from '@remixicon/react';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

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

    const [selectedDate, setSelectedDate] = useState({
        start_date: url_start_date || dayjs(new Date().toISOString()).format("YYYY-MM-DD"),
        end_date: url_end_date || dayjs(new Date().toISOString()).format("YYYY-MM-DD")
    });
    const [showFilters, setShowFilters] = useState(false);

    const handleLoad = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `test/ascension/pendingCases?filter=${filter}&&count=10&&page=1&&start_date=${selectedDate.start_date}&end_date=${selectedDate.end_date}`;
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
            start_date: '',
            end_date: ''
        });
    };

    return (
        <div className="container-fluid px-4 py-3">
            <div className="d-flex justify-content-end align-items-center mb-4">
                <Button
                    variant="outline-primary"
                    size='sm'
                    onClick={() => setShowFilters(true)}
                    className="d-flex align-items-center"
                >
                    <RiFilterLine size={16} className="me-2" />
                    Filters
                </Button>
            </div>

            {/* Filter Offcanvas */}
            <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end">
                <Offcanvas.Header closeButton style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <Offcanvas.Title className="d-flex align-items-center">
                        <RiFilterLine size={20} className="me-2" />
                        Filter Options
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="row g-3">
                        <div className="col-12">
                            <label htmlFor="start-date" className="form-label fw-medium" style={{ color: COLOR_TEXT_MUTED }}>
                                <RiCalendarEventLine size={16} className="me-1" />
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="start-date"
                                className="form-control shadow-none"
                                style={{ borderColor: COLOR_BORDER }}
                                value={selectedDate.start_date}
                                onChange={e => setSelectedDate({ ...selectedDate, start_date: e.target.value })}
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="end-date" className="form-label fw-medium" style={{ color: COLOR_TEXT_MUTED }}>
                                <RiCalendarEventLine size={16} className="me-1" />
                                End Date
                            </label>
                            <input
                                type="date"
                                id="end-date"
                                className="form-control shadow-none"
                                style={{ borderColor: COLOR_BORDER }}
                                value={selectedDate.end_date}
                                onChange={e => setSelectedDate({ ...selectedDate, end_date: e.target.value })}
                            />
                        </div>
                        <div className="col-12">
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
                        <div className="col-12">
                            <div className="d-flex gap-2 mt-3">
                                <Button
                                    onClick={() => {
                                        handleLoad();
                                        setShowFilters(false);
                                    }}
                                    disabled={loading}
                                    className="d-flex align-items-center justify-content-center flex-fill"
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
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

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