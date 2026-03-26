'use client';
import React from 'react';
import Link from 'next/link';
import {
     RiShoppingCartLine,
     RiFileListLine,
     RiMedicineBottleLine,
     RiAlarmWarningLine,
} from '@remixicon/react';

const modules = [
     {
          title: 'Point of Sale',
          link: '/pharmacy/sell',
          icon: <RiShoppingCartLine size={28} />,
          color: '#1E88E5',
          description:
               'Rapidly sell drugs and medications to walk-in clients. Search for drugs, add to cart, apply discounts, and process cash or mobile money payments instantly.',
     },
     {
          title: 'Sales History',
          link: '/pharmacy/sales-history',
          icon: <RiFileListLine size={28} />,
          color: '#43A047',
          description:
               'View and review all pharmacy sales transactions. Filter by date range, customer name, or payment method. Print receipts for past sales.',
     },
     {
          title: 'Drug Stock',
          link: '/pharmacy/stock',
          icon: <RiMedicineBottleLine size={28} />,
          color: '#8E24AA',
          description:
               'Monitor current drug inventory levels. View quantity on hand, selling prices, and expiry dates for all pharmaceutical stock.',
     },
     {
          title: 'Low Stock Alerts',
          link: '/pharmacy/stock?filter=low',
          icon: <RiAlarmWarningLine size={28} />,
          color: '#E53935',
          description:
               'Quickly identify drugs running low on stock. Items falling below minimum threshold are flagged here for timely reordering.',
     },
];

const getIconStyle = (color: string) => ({
     color,
     background: `${color}18`,
     padding: '10px',
     borderRadius: '8px',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     width: '52px',
     height: '52px',
     flexShrink: 0,
});

export default function PharmacyPage() {
     return (
          <div className="py-3">
               <div className="mb-4 pb-2 border-bottom">
                    <h4 className="mb-1 fw-bold" style={{ color: '#1E88E5' }}>
                         Pharmacy
                    </h4>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                         Manage drug dispensing, sales, and stock levels from one place
                    </p>
               </div>

               <div className="row g-3">
                    {modules.map((mod, index) => (
                         <div key={index} className="col-12 col-md-6 col-lg-3">
                              <Link href={mod.link} className="text-decoration-none">
                                   <div
                                        className="card h-100 border-0 shadow-sm"
                                        style={{ borderRadius: '8px', transition: 'box-shadow 0.2s' }}
                                   >
                                        <div className="card-body p-3">
                                             <div className="d-flex align-items-center mb-3">
                                                  <div className="me-3" style={getIconStyle(mod.color)}>
                                                       {mod.icon}
                                                  </div>
                                                  <h3 className="h6 mb-0 fw-semibold">{mod.title}</h3>
                                             </div>
                                             <p className="text-muted small mb-0">{mod.description}</p>
                                        </div>
                                   </div>
                              </Link>
                         </div>
                    ))}
               </div>
          </div>
     );
}
