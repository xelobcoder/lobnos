import React from 'react';

interface StatusBadgeProps {
     status: 'draft' | 'calculated' | 'approved' | 'locked' | 'paid';
     size?: 'sm' | 'md' | 'lg';
}

export const PayrollStatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
     const statusConfig = {
          draft: {
               label: 'Draft',
               class: 'bg-secondary text-white',
               icon: '📝'
          },
          calculated: {
               label: 'Calculated',
               class: 'bg-info text-white',
               icon: '🧮'
          },
          approved: {
               label: 'Approved',
               class: 'bg-success text-white',
               icon: '✅'
          },
          locked: {
               label: 'Locked',
               class: 'bg-warning text-dark',
               icon: '🔒'
          },
          paid: {
               label: 'Paid',
               class: 'bg-primary text-white',
               icon: '💰'
          }
     };

     const config = statusConfig[status] || statusConfig.draft;
     const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';

     return (
          <span className={`badge ${config.class} ${sizeClass} d-inline-flex align-items-center gap-1`}>
               <span>{config.icon}</span>
               <span>{config.label}</span>
          </span>
     );
};

interface CompensationStatusBadgeProps {
     isActive: boolean;
     size?: 'sm' | 'md' | 'lg';
}

export const CompensationStatusBadge: React.FC<CompensationStatusBadgeProps> = ({ isActive, size = 'md' }) => {
     const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';

     return isActive ? (
          <span className={`badge bg-success text-white ${sizeClass}`}>
               ✓ Active
          </span>
     ) : (
          <span className={`badge bg-secondary text-white ${sizeClass}`}>
               ✗ Inactive
          </span>
     );
};

interface CompensationTypeBadgeProps {
     type: 'salary' | 'hourly' | 'commission' | 'hybrid';
     size?: 'sm' | 'md' | 'lg';
}

export const CompensationTypeBadge: React.FC<CompensationTypeBadgeProps> = ({ type, size = 'md' }) => {
     const typeConfig = {
          salary: { label: 'Salary', class: 'bg-primary text-white', icon: '💼' },
          hourly: { label: 'Hourly', class: 'bg-info text-white', icon: '⏰' },
          commission: { label: 'Commission', class: 'bg-warning text-dark', icon: '💵' },
          hybrid: { label: 'Hybrid', class: 'bg-success text-white', icon: '🔄' }
     };

     const config = typeConfig[type] || typeConfig.salary;
     const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';

     return (
          <span className={`badge ${config.class} ${sizeClass} d-inline-flex align-items-center gap-1`}>
               <span>{config.icon}</span>
               <span>{config.label}</span>
          </span>
     );
};
