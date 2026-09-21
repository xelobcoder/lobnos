
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { customFetch } from "../../../../components/Auth/customFetch";
import PhelobotomyMainPageClientModule from "../../../../components/phelobotomy/ReceiveLabSampleModal/PhelobotomyMainPageClientModule";
import { Alert, Button, Spinner } from "react-bootstrap";
import {
    RiFilterOffLine,
    RiFlaskLine,
    RiRefreshLine,
    RiSearchLine,
    RiTestTubeLine,
    RiTimeLine,
} from "@remixicon/react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

const COLOR_ACCENT = "oklch(0.646 0.222 41.116)";
const COLOR_BORDER = "var(--bs-border-color)";
const COLOR_TEXT_MUTED = "var(--bs-secondary-color)";

export default function PagePhelobotomy() {
    const searchParams = useSearchParams();

    const [data, setData] = useState<any[]>([]);
    const [filter, setFilter] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const url_start_date = searchParams?.get("start_date") || "";
    const url_end_date = searchParams?.get("end_date") || "";
    const billingid = searchParams?.get("billingid") || "";

    const today = dayjs().format("YYYY-MM-DD");

    const [selectedDate, setSelectedDate] = useState({
        _dateFrom: url_start_date || today,
        _dateEnd: url_end_date || today,
    });

    const [dateFilter, setDateFilter] = useState("");

    const handleLoad = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const url = billingid
                ? `test/ascension/pendingCases?billingid=${billingid}&count=10&page=1`
                : `test/ascension/pendingCases?filter=${encodeURIComponent(
                      filter
                  )}&count=10&page=1&start_date=${
                      selectedDate._dateFrom
                  }&end_date=${selectedDate._dateEnd}`;

            const { result } = await customFetch(url);

            setData(
                Array.isArray(result) && result.length > 0 ? result : []
            );
        } catch (err) {
            setError(
                "Failed to load pending samples. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    }, [
        billingid,
        filter,
        selectedDate._dateFrom,
        selectedDate._dateEnd,
    ]);

    useEffect(() => {
        handleLoad();
    }, [handleLoad]);

    const handleClearFilters = () => {
        setFilter("");
        setDateFilter("");

        setSelectedDate({
            _dateFrom: today,
            _dateEnd: today,
        });
    };

    const hasActiveFilters =
        Boolean(filter) ||
        Boolean(dateFilter) ||
        Boolean(
            selectedDate._dateFrom &&
                selectedDate._dateFrom !== today
        ) ||
        Boolean(
            selectedDate._dateEnd &&
                selectedDate._dateEnd !== today
        );

    return (
        <div className="container-fluid px-3 px-lg-4 py-3 py-lg-4">
            {/* Page Header */}
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                                width: 46,
                                height: 46,
                                background: `${COLOR_ACCENT}15`,
                                color: COLOR_ACCENT,
                            }}
                        >
                            <RiFlaskLine size={24} />
                        </div>

                        <div>
                            <h4 className="mb-0 fw-bold">
                                Phlebotomy
                            </h4>

                            <div
                                className="small"
                                style={{
                                    color: COLOR_TEXT_MUTED,
                                }}
                            >
                                Pending laboratory samples awaiting
                                collection
                            </div>
                        </div>
                    </div>
                </div>

                {/* Queue indicator */}
                <div
                    className="d-flex align-items-center gap-3 px-3 py-2 rounded-3"
                    style={{
                        background: "#fff",
                        border: `1px solid ${COLOR_BORDER}`,
                    }}
                >
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: 34,
                            height: 34,
                            background: `${COLOR_ACCENT}12`,
                            color: COLOR_ACCENT,
                        }}
                    >
                        <RiTimeLine size={17} />
                    </div>

                    <div>
                        <div
                            className="small"
                            style={{
                                color: COLOR_TEXT_MUTED,
                            }}
                        >
                            Pending queue
                        </div>

                        <div className="fw-bold">
                            {loading ? "Loading..." : data.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div
                className="card border-0 shadow-sm mb-4"
                style={{
                    borderRadius: "0.75rem",
                }}
            >
                <div className="card-body p-3 p-lg-4">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-3">
                        <div>
                            <h6 className="fw-bold mb-1">
                                Find samples
                            </h6>

                            <div
                                className="small"
                                style={{
                                    color: COLOR_TEXT_MUTED,
                                }}
                            >
                                Search the pending sample queue by
                                patient, case, or billing information.
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <span
                                className="badge rounded-pill px-3 py-2"
                                style={{
                                    background: `${COLOR_ACCENT}12`,
                                    color: COLOR_ACCENT,
                                    fontWeight: 500,
                                }}
                            >
                                Filters active
                            </span>
                        )}
                    </div>

                    <div className="row g-3 align-items-end">
                        {/* Date */}
                        <div className="col-12 col-xl-3">
                            <DateFilterReusable
                                value={dateFilter}
                                onChange={setDateFilter}
                                onDateRangeChange={(
                                    startDate,
                                    endDate
                                ) => {
                                    setSelectedDate({
                                        _dateFrom: startDate,
                                        _dateEnd: endDate,
                                    });
                                }}
                                label="Date range"
                                className="w-100"
                            />
                        </div>

                        {/* Search */}
                        <div className="col-12 col-xl">
                            <label
                                htmlFor="search-filter"
                                className="form-label small fw-semibold mb-2"
                            >
                                Search samples
                            </label>

                            <div className="position-relative">
                                <RiSearchLine
                                    size={18}
                                    className="position-absolute"
                                    style={{
                                        left: 13,
                                        top: "50%",
                                        transform:
                                            "translateY(-50%)",
                                        color: COLOR_TEXT_MUTED,
                                        pointerEvents: "none",
                                    }}
                                />

                                <input
                                    id="search-filter"
                                    className="form-control shadow-none"
                                    style={{
                                        paddingLeft: 40,
                                        height: 42,
                                        borderColor: COLOR_BORDER,
                                    }}
                                    onChange={(e) =>
                                        setFilter(e.target.value)
                                    }
                                    value={filter}
                                    type="text"
                                    placeholder="Patient name, case ID, billing ID..."
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="col-12 col-xl-auto">
                            <div className="d-flex gap-2">
                                <Button
                                    onClick={handleLoad}
                                    disabled={loading}
                                    className="d-flex align-items-center justify-content-center px-3"
                                    style={{
                                        backgroundColor:
                                            COLOR_ACCENT,
                                        borderColor:
                                            COLOR_ACCENT,
                                        height: 42,
                                    }}
                                >
                                    {loading ? (
                                        <Spinner
                                            size="sm"
                                            animation="border"
                                            className="me-2"
                                        />
                                    ) : (
                                        <RiRefreshLine
                                            size={17}
                                            className="me-2"
                                        />
                                    )}

                                    {loading
                                        ? "Loading..."
                                        : "Load samples"}
                                </Button>

                                <Button
                                    onClick={
                                        handleClearFilters
                                    }
                                    variant="outline-secondary"
                                    disabled={
                                        loading ||
                                        !hasActiveFilters
                                    }
                                    className="d-flex align-items-center justify-content-center"
                                    style={{
                                        width: 42,
                                        height: 42,
                                    }}
                                    title="Clear filters"
                                >
                                    <RiFilterOffLine size={17} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <Alert
                    dismissible
                    variant="danger"
                    className="mb-4 border-0 shadow-sm"
                    onClose={() => setError(null)}
                    style={{
                        borderRadius: "0.75rem",
                    }}
                >
                    <div className="d-flex align-items-start gap-3">
                        <div className="flex-shrink-0">
                            <RiTestTubeLine size={20} />
                        </div>

                        <div>
                            <div className="fw-semibold mb-1">
                                Unable to load samples
                            </div>

                            <div className="small">
                                {error}
                            </div>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Loading state */}
            {loading && data.length === 0 ? (
                <div
                    className="card border-0 shadow-sm"
                    style={{
                        borderRadius: "0.75rem",
                    }}
                >
                    <div className="card-body py-5">
                        <div className="d-flex flex-column align-items-center justify-content-center text-center">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                                style={{
                                    width: 56,
                                    height: 56,
                                    background: `${COLOR_ACCENT}12`,
                                    color: COLOR_ACCENT,
                                }}
                            >
                                <Spinner
                                    animation="border"
                                    size="sm"
                                />
                            </div>

                            <h6 className="fw-semibold mb-1">
                                Loading pending samples
                            </h6>

                            <p
                                className="small mb-0"
                                style={{
                                    color: COLOR_TEXT_MUTED,
                                }}
                            >
                                Retrieving the latest collection
                                queue...
                            </p>
                        </div>
                    </div>
                </div>
            ) : data.length === 0 ? (
                /* Empty state */
                <div
                    className="card border-0 shadow-sm"
                    style={{
                        borderRadius: "0.75rem",
                    }}
                >
                    <div className="card-body py-5">
                        <div className="d-flex flex-column align-items-center justify-content-center text-center">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                                style={{
                                    width: 64,
                                    height: 64,
                                    background: "#f8f9fa",
                                    color: COLOR_TEXT_MUTED,
                                }}
                            >
                                <RiTestTubeLine size={28} />
                            </div>

                            <h6 className="fw-bold mb-1">
                                No pending samples
                            </h6>

                            <p
                                className="small mb-3"
                                style={{
                                    maxWidth: 420,
                                    color: COLOR_TEXT_MUTED,
                                }}
                            >
                                There are no laboratory samples
                                matching the selected date range or
                                search criteria.
                            </p>

                            {hasActiveFilters && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={
                                        handleClearFilters
                                    }
                                    className="d-flex align-items-center gap-2"
                                >
                                    <RiFilterOffLine
                                        size={15}
                                    />
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Main content */
                <div
                    className="card border-0 shadow-sm overflow-hidden"
                    style={{
                        borderRadius: "0.75rem",
                    }}
                >
                    <div
                        className="px-3 px-lg-4 py-3 border-bottom"
                        style={{
                            background: "#fff",
                        }}
                    >
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                            <div>
                                <h6 className="fw-bold mb-1">
                                    Samples awaiting collection
                                </h6>

                                <div
                                    className="small"
                                    style={{
                                        color: COLOR_TEXT_MUTED,
                                    }}
                                >
                                    Review patient requests and
                                    proceed with sample collection.
                                </div>
                            </div>

                            <div
                                className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                                style={{
                                    background: `${COLOR_ACCENT}10`,
                                    color: COLOR_ACCENT,
                                }}
                            >
                                <RiTestTubeLine size={16} />

                                <span className="small fw-semibold">
                                    {data.length} pending
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-0">
                        <PhelobotomyMainPageClientModule
                            data={data}
                            filter={{
                                filter,
                                ...selectedDate,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

