#!/bin/bash

# Define the base path for the components
COMPONENTS_DIR="/f/PROJECTS/LobnosProfessionalVersion/lobnos/components/analytics/clinicians-analytics"

# Create the directory if it doesn't exist
mkdir -p $COMPONENTS_DIR

# List of routes and their corresponding component names
declare -A routes=(
    ["overall"]="OverallTotal"
    ["monthly"]="MonthlyTotals"
    ["yearly"]="YearlyTotals"
    ["case-summary/overall"]="CaseSummaryOverall"
    ["case-summary/monthly"]="CaseSummaryMonthly"
    ["case-summary/yearly"]="CaseSummaryYearly"
    ["case-summary/daily"]="CaseSummaryDailyRecent"
    ["case-change/daily"]="DailyCaseChange"
    ["case-change/monthly"]="MonthlyCaseChange"
    ["case-change/yearly"]="YearlyCaseChange"
    ["revenue"]="ClinicianRevenueVsTotal"
    ["payment-summary"]="PaymentTypeSummary"
    ["shift-distribution"]="CasesByShift"
    ["outsourced"]="CasesByOutsourced"
    ["growth"]="YearlyGrowthStats"
    ["test-breakdown"]="MonthlyTestBreakdown"
    ["top-outsourced"]="TopOutsourcedTests"
    ["dashboard"]="AllAnalytics"
    ["endpoints"]="Endpoints"
)

# Loop through the routes and create components
for route in "${!routes[@]}"; do
    component_name="ClinicianAnalytics${routes[$route]}"
    component_file="$COMPONENTS_DIR/$component_name.tsx"

    echo "Creating component for route: $route"

    # Write the component code to the file
    cat <<EOF > $component_file
import React from 'react';

const $component_name = ({ clinicianId }) => {
    return (
        <div>
            <h1>$component_name</h1>
            <p>Clinician ID: {clinicianId}</p>
            {/* Add your component logic here */}
        </div>
    );
};

export default $component_name;
EOF

    echo "Created component: $component_file"
done

echo "All components created successfully!"