import React from 'react';
import { toast } from 'react-toastify';
import { customFetch, currencyFormatter } from '../../Auth/customFetch';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PercentIcon from '@mui/icons-material/Percent';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';

interface Summary {
    registeredClient: number;
    billedClients: number;
    dayExpenseSum: number;
    salesAmount: number;
    totalCases: number;
    discount: number;
    totalAmountReceived: number;
}

const _default: Summary = {
    registeredClient: 0,
    billedClients: 0,
    dayExpenseSum: 0,
    salesAmount: 0,
    totalCases: 0,
    discount: 0,
    totalAmountReceived: 0,
};

export type AnalyticCardProps = {
    title: string;
    value: number;
    Icon: React.ElementType;
    bgColor: string;
    iconColor: string;
    formatAsCurrency?: boolean;
};

const AnalyticCard = ({
    title,
    value,
    Icon,
    bgColor,
    iconColor,
    formatAsCurrency = true,
}: AnalyticCardProps) => (
    <div
        className="card border-0 shadow rounded mb-3"
        style={{
            background: bgColor,
            borderRadius: '12px',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            height: '89px',
            flex: '1 1 auto',
            margin: '0 8px',
        }}
    >
        <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                        backgroundColor: iconColor,
                        padding: '6px',
                        borderRadius: '6px',
                    }}
                >
                    <Icon style={{ fontSize: '1rem', color: 'white' }} />
                </div>
                <h6 className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                    {title}
                </h6>
            </div>
            <div className="fw-bold" style={{ fontSize: '1rem' }}>
                {formatAsCurrency ? currencyFormatter.format(Number(value) || 0) : value}
            </div>
        </div>
    </div>
);

const cardColors = {
    billedClients: { bg: '#ECF2FF', icon: '#3B82F6' },
    totalSales: { bg: '#E8FDF5', icon: '#10B981' },
    amountPaid: { bg: '#FFF4ED', icon: '#F97316' },
    discount: { bg: '#F3E8FF', icon: '#E11D48' },
    pendingDebts: { bg: '#FEF3C7', icon: '#F59E0B' },
    expenses: { bg: '#FEE2E2', icon: '#EF4444' },
};

export default async function BilledSummary({ branchid }: { branchid: string }) {
    let summary: Summary = _default;
    try {
        const data = await customFetch(`summary/daily?branchid=${branchid}`);
        summary = data;
    } catch (err) {
        toast.error('Something went wrong', { autoClose: 3000, position: 'bottom-right' });
        summary = _default;
    }

    

    return (
        <div className="">
            <div className="d-flex flex-column flex-md-row gap-1">
                <AnalyticCard
                    title="Billed Clients"
                    value={summary.billedClients}
                    Icon={PeopleAltIcon}
                    bgColor={cardColors.billedClients.bg}
                    iconColor={cardColors.billedClients.icon}
                    formatAsCurrency={false}
                />
                <AnalyticCard
                    title="Total Sales"
                    value={summary.salesAmount}
                    Icon={AttachMoneyIcon}
                    bgColor={cardColors.totalSales.bg}
                    iconColor={cardColors.totalSales.icon}
                />
                <AnalyticCard
                    title="Amount Paid"
                    value={summary.totalAmountReceived}
                    Icon={ReceiptIcon}
                    bgColor={cardColors.amountPaid.bg}
                    iconColor={cardColors.amountPaid.icon}
                />
                <AnalyticCard
                    title="Discount"
                    value={summary.discount}
                    Icon={PercentIcon}
                    bgColor={cardColors.discount.bg}
                    iconColor={cardColors.discount.icon}
                />
                <AnalyticCard
                    title="Pending Debts"
                    value={summary.salesAmount - summary.totalAmountReceived}
                    Icon={AccountBalanceWalletIcon}
                    bgColor={cardColors.pendingDebts.bg}
                    iconColor={cardColors.pendingDebts.icon}
                />
                <AnalyticCard
                    title="Expenses Incurred"
                    value={summary.dayExpenseSum > 0 ? summary.dayExpenseSum : 0}
                    Icon={MoneyOffIcon}
                    bgColor={cardColors.expenses.bg}
                    iconColor={cardColors.expenses.icon}
                />
            </div>
        </div>
    );
}