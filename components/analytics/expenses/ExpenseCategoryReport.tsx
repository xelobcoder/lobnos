"use client";

import React, { useState, useEffect } from 'react';

// Interfaces
interface RawExpense {
  id: number;
  name: string;
  amount: number;
  expense_category_name: string;
}

interface CategorySummary {
  category_name: string;
  total_amount: number;
}

// Mock data for raw expenses
const mockRawExpenses: RawExpense[] = [
  { id: 1, name: 'Flight to Conference', amount: 300, expense_category_name: 'Travel' },
  { id: 2, name: 'Client Dinner', amount: 150, expense_category_name: 'Meals & Entertainment' },
  { id: 3, name: 'Project Software', amount: 50, expense_category_name: 'Software & Subscriptions' },
  { id: 4, name: 'Team Lunch', amount: 120, expense_category_name: 'Meals & Entertainment' },
  { id: 5, name: 'New Keyboard', amount: 70, expense_category_name: 'Office Supplies' },
  { id: 6, name: 'Return Flight', amount: 280, expense_category_name: 'Travel' },
  { id: 7, name: 'Cloud Hosting Bill', amount: 85, expense_category_name: 'Software & Subscriptions' },
  { id: 8, name: 'Stationery', amount: 25, expense_category_name: 'Office Supplies' },
];

// Currency formatter (simple version, consider using Intl.NumberFormat for more complex needs)
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD', // Adjust currency as needed
});

const ExpenseCategoryReport: React.FC = () => {
  const [summaryData, setSummaryData] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      // Process raw expenses to calculate totals per category
      const categoryMap: { [key: string]: number } = {};

      mockRawExpenses.forEach(expense => {
        if (categoryMap[expense.expense_category_name]) {
          categoryMap[expense.expense_category_name] += expense.amount;
        } else {
          categoryMap[expense.expense_category_name] = expense.amount;
        }
      });

      const processedSummary: CategorySummary[] = Object.keys(categoryMap).map(categoryName => ({
        category_name: categoryName,
        total_amount: categoryMap[categoryName],
      })).sort((a, b) => b.total_amount - a.total_amount); // Sort by total amount descending

      setSummaryData(processedSummary);
      setIsLoading(false);
      // In a real app:
      // customFetch('/api/analytics/expenses-by-category') // Conceptual API endpoint
      //   .then(data => {
      //     setSummaryData(data); // Assuming API returns data in CategorySummary[] format
      //     setIsLoading(false);
      //   })
      //   .catch(error => {
      //     console.error('Error fetching expense summary:', error);
      //     setIsLoading(false);
      //   });
    }, 1000); // Simulate 1 second delay
  }, []);

  if (isLoading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Expenses by Category</h5>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (summaryData.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Expenses by Category</h5>
          <div className="alert alert-info" role="alert">
            No expense data available to display.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header">
        <h5 className="mb-0">Expenses by Category</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Category</th>
                <th className="text-end">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((item, index) => (
                <tr key={index}>
                  <td>{item.category_name}</td>
                  <td className="text-end">{currencyFormatter.format(item.total_amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light">
                <tr>
                    <td className="fw-bold">Total All Categories</td>
                    <td className="text-end fw-bold">
                        {currencyFormatter.format(summaryData.reduce((acc, item) => acc + item.total_amount, 0))}
                    </td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
      {/* Placeholder for chart if added later */}
      {/* <div className="card-footer">
        <p className="text-muted small">Chart will be displayed here.</p>
      </div> */}
    </div>
  );
};

export default ExpenseCategoryReport;
