'use client';

import { useRouter } from 'next/navigation';

interface ExpenseStatusButtonsProps {
    status: number;
    expenseId: number;
}

const ExpenseStatusButtons: React.FC<ExpenseStatusButtonsProps> = ({ status, expenseId }) => {
    const router = useRouter();

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    if (status === 0) {
        return (
            <div className="d-flex align-items-center gap-2">
                <button
                    className="btn btn-sm btn-primary mx-1"
                    onClick={() => handleNavigate(`/billing/expenses/expense-audit-log/${expenseId}`)}
                >
                    Audit
                </button>
                <span className="text-warning fw-semibold">Pending</span>
                <button
                    className="btn btn-sm btn-outline-primary mx-1"
                    onClick={() => handleNavigate(`/billing/expenses/edit-expense?id=${expenseId}`)}
                >
                    Edit
                </button>
            </div>
        );
    }

    if (status === 1) {
        return (
            <div className="d-flex align-items-center gap-2">
                <button
                    className="btn btn-sm btn-primary mx-1"
                    onClick={() => handleNavigate(`/billing/expenses/expense-audit-log/${expenseId}`)}
                >
                    Audit
                </button>
                <span className="text-success fw-semibold">Approved</span>
                <button
                    className="btn btn-sm btn-outline-secondary mx-1"
                    onClick={() => handleNavigate(`/billing/expenses/receipt/${expenseId}`)}
                >
                    Upload Receipt
                </button>
            </div>
        );
    }

    // Rejected case
    return (
        <div className="d-flex align-items-center gap-2">
            <button
                className="btn btn-sm btn-primary mx-1"
                onClick={() => handleNavigate(`/billing/expenses/expense-audit-log/${expenseId}`)}
            >
                Audit
            </button>
            <button className="btn btn-danger ">Rejected</button>
        </div>
    );
};

export default ExpenseStatusButtons;
