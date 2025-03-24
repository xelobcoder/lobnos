import React from 'react';

interface PaginationProps {
    currentPage: number;
    onPageChange: (page: number) => void;
    totalPages: number;
}

export default function UsePaginationHook({ currentPage, onPageChange, totalPages }: PaginationProps) {
    const handlePagination = (value: number | 'Next' | 'Previous') => {
        let newPage = currentPage;

        if (typeof value === 'number') {
            newPage = value;
        }

        if (typeof value === 'string' && value === 'Next') {
            newPage = currentPage + 1;
        }

        if (typeof value === 'string' && value === 'Previous') {
            newPage = currentPage - 1;
        }

        if (newPage > 0) {
            onPageChange(newPage);
        }
    };

    const pageNumbers = [...Array(10).keys()].map(i => i + 1);

    return (
        <div className="d-flex justify-content-end">
            {pageNumbers.map(item => (
                <span
                    key={item}
                    onClick={() => handlePagination(item)}
                    className={`btn btn-outline-secondary mx-1 ${currentPage === item ? 'active' : ''}`}
                >
                    {item}
                </span>
            ))}

            <span
                onClick={() => handlePagination('Previous')}
                className={`btn btn-outline-secondary mx-1 ${currentPage === 1 ? 'disabled' : ''}`}
            >
                Previous
            </span>

            <span
                onClick={() => handlePagination('Next')}
                className={`btn btn-outline-secondary mx-1 ${currentPage > totalPages ? 'active' : ''}`}
            >
                Next
            </span>

            {currentPage > totalPages && (
                <span
                    className="btn btn-danger mx-1"
                    style={{ backgroundColor: '#ff7f50', borderColor: '#ff7f50' }}
                >
                    {`Page ${currentPage}`}
                </span>
            )}
        </div>
    );
}
