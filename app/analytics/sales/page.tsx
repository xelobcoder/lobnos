import React from 'react';
import ExpenseCategoryReport from '../../../../components/analytics/expenses/ExpenseCategoryReport'; // Adjusted path

export default function AnalyticsSales() {
  return (
    <div className="container-fluid p-4"> {/* Added container for better layout */}
      <h1 className="h2 mb-4">Sales & Expense Analytics</h1> {/* Updated title, added margin */}
      
      {/* Placeholder for other sales-related analytics components can go here */}
      {/* 
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Sales Chart 1</h5>
              <p>...</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Sales Data Table</h5>
              <p>...</p>
            </div>
          </div>
        </div>
      </div> 
      */}

      {/* Section for Expense Category Report */}
      <div className="mt-5"> {/* Added top margin for separation */}
        {/* The ExpenseCategoryReport component already has a card-like structure */}
        <ExpenseCategoryReport />
      </div>
    </div>
  )
}
