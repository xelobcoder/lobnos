'use client';

import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import Link from 'next/link';
import {
  RiBarChartLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiTimeLine,
  RiShoppingBagLine,
  RiUserLine,
  RiBuildingLine,
  RiArrowUpLine,
  RiFileListLine,
  RiArrowRightLine,
  RiCalendarEventLine,
  RiBarChartBoxLine,
  RiCloseCircleLine
} from '@remixicon/react';

const expenseAnalyticsSections = [
  {
    title: 'Daily Expense Summary',
    description: 'Detailed breakdown of expenses by day with trends and patterns',
    icon: RiCalendarEventLine,
    path: '/analytics/expenses/daily-expense-summary',
    color: 'primary',
    badge: 'Daily'
  },
  {
    title: 'Weekly Expense Summary',
    description: 'Weekly expense analysis with comparison to previous weeks',
    icon: RiCalendarLine,
    path: '/analytics/expenses/weekly-expense-summary',
    color: 'success',
    badge: 'Weekly'
  },
  {
    title: 'Monthly Expenses',
    description: 'Comprehensive monthly expense tracking and analysis',
    icon: RiBarChartLine,
    path: '/analytics/expenses/monthly-expenses',
    color: 'info',
    badge: 'Monthly'
  },
  {
    title: 'Quarterly Expense Summary',
    description: 'Quarterly expense trends and seasonal analysis',
    icon: RiTimeLine,
    path: '/analytics/expenses/quarterly-expense-summary',
    color: 'warning',
    badge: 'Quarterly'
  },
  {
    title: 'Yearly Expense Summary',
    description: 'Annual expense overview with year-over-year comparisons',
    icon: RiBarChartBoxLine,
    path: '/analytics/expenses/yearly-expense-summary',
    color: 'danger',
    badge: 'Yearly'
  },
  {
    title: 'Top Expense Categories',
    description: 'Analysis of highest spending categories and cost centers',
    icon: RiShoppingBagLine,
    path: '/analytics/expenses/top-expense-categories',
    color: 'secondary',
    badge: 'Categories'
  },
  {
    title: 'Top Expense Employees',
    description: 'Employee spending patterns and cost analysis',
    icon: RiUserLine,
    path: '/analytics/expenses/top-expense-employees',
    color: 'dark',
    badge: 'Employees'
  },
  {
    title: 'Top Expense Merchants',
    description: 'Vendor and merchant expense analysis and rankings',
    icon: RiBuildingLine,
    path: '/analytics/expenses/top-expense-merchants',
    color: 'primary',
    badge: 'Merchants'
  },
  {
    title: 'Expense Growth Rate',
    description: 'Expense growth trends and forecasting analysis',
    icon: RiArrowUpLine,
    path: '/analytics/expenses/expense-growth-rate',
    color: 'success',
    badge: 'Growth'
  },
  {
    title: 'Expense Payment Status',
    description: 'Payment status tracking and outstanding expense analysis',
    icon: RiFileListLine,
    path: '/analytics/expenses/expense-payment-status',
    color: 'info',
    badge: 'Payments'
  },
  {
    title: 'Expense Approval Timeline',
    description: 'Approval process analysis and timeline metrics',
    icon: RiTimeLine,
    path: '/analytics/expenses/expense-approval-timeline',
    color: 'warning',
    badge: 'Approval'
  },
  {
    title: 'Expense Buckets',
    description: 'Categorized expense buckets and budget allocation analysis',
    icon: RiMoneyDollarCircleLine,
    path: '/analytics/expenses/expense-buckets',
    color: 'danger',
    badge: 'Buckets'
  },
  {
    title: 'Branch Monthly Expenses',
    description: 'Branch-wise monthly expense comparison and analysis',
    icon: RiBuildingLine,
    path: '/analytics/expenses/branch-monthly-expenses',
    color: 'secondary',
    badge: 'Branch'
  },
  {
    title: 'Hourly Expense Summary',
    description: 'Hourly expense patterns and peak spending analysis',
    icon: RiTimeLine,
    path: '/analytics/expenses/hourly-expense-summary',
    color: 'dark',
    badge: 'Hourly'
  },
  {
    title: 'Comparison by Period',
    description: 'Period-over-period expense comparison and variance analysis',
    icon: RiBarChartLine,
    path: '/analytics/expenses/comparison-by-period',
    color: 'primary',
    badge: 'Compare'
  },
  {
    title: 'Rejected Expenses',
    description: 'Overview of rejected expense claims and amounts',
    icon: RiCloseCircleLine,
    path: '/analytics/expenses/rejected',
    color: 'danger',
    badge: 'Rejected'
  }
];

export default function ExpensesAnalytics() {
  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <RiBarChartBoxLine className="me-2" />
            Expense Analytics Overview
          </h2>
          <p className="text-muted mb-0">Comprehensive expense analysis across multiple dimensions and time periods</p>
        </div>
      </div>

      {/* Analytics Sections Grid */}
      <div className="row g-4">
        {expenseAnalyticsSections.map((section, index) => (
          <div className="col-lg-4 col-md-6" key={index}>
            <Card className="h-100 hover-shadow border" style={{ borderRadius: '0.75rem' }}>
              <Card.Body className="d-flex flex-column p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className={`bg-${section.color} bg-opacity-10 p-3 rounded me-3`}>
                    <section.icon size={24} className={`text-${section.color}`} />
                  </div>
                  {section.badge && (
                    <Badge bg={section.color} className="ms-auto">
                      {section.badge}
                    </Badge>
                  )}
                </div>
                <h5 className="card-title fw-semibold mb-2">{section.title}</h5>
                <p className="text-muted small mb-3 flex-grow-1">{section.description}</p>
                <Link href={section.path} className={`btn btn-${section.color} btn-sm mt-auto w-100 d-flex align-items-center justify-content-center`}>
                  View Details <RiArrowRightLine size={16} className="ms-2" />
                </Link>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Quick Stats Summary */}
      <div className="row g-3 mt-4">
        <div className="col-12">
          <Card className="border" style={{ borderRadius: '0.75rem' }}>
            <Card.Body className="p-4">
              <h5 className="card-title fw-semibold mb-3 d-flex align-items-center">
                <RiBarChartLine className="me-2" />
                Quick Overview
              </h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="text-center p-3 border rounded">
                    <RiMoneyDollarCircleLine size={32} className="text-primary mb-2" />
                    <h6 className="fw-bold text-primary">Total Expenses</h6>
                    <p className="text-muted small mb-0">Comprehensive expense tracking</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3 border rounded">
                    <RiArrowUpLine size={32} className="text-success mb-2" />
                    <h6 className="fw-bold text-success">Growth Analysis</h6>
                    <p className="text-muted small mb-0">Expense trend monitoring</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3 border rounded">
                    <RiShoppingBagLine size={32} className="text-info mb-2" />
                    <h6 className="fw-bold text-info">Category Insights</h6>
                    <p className="text-muted small mb-0">Spending pattern analysis</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3 border rounded">
                    <RiUserLine size={32} className="text-warning mb-2" />
                    <h6 className="fw-bold text-warning">Employee Tracking</h6>
                    <p className="text-muted small mb-0">Individual expense monitoring</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
