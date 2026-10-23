'use client';
import {useParams} from 'next/navigation';
import Link from 'next/link';
import ExpenseReceipts from '../../../../../components/Expense/ExpenseReceipts';
export default function ReceiptPage(){const params=useParams();return <main className="container py-4"><Link href="/billing/expenses">Back to expenses</Link><h1 className="h4 mt-3">Expense receipts</h1><ExpenseReceipts expenseId={Number(params.id)} editable/></main>;}
