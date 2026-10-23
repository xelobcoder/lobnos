import './expenses.css';

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
    return <div className="expense-pages">{children}</div>;
}
