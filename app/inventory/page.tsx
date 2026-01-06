'use client';

import React from 'react';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiAlertLine, RiCloseLine, RiStoreLine, RiBox3Line, RiPriceTagLine, RiBarChartLine, RiShoppingCartLine, RiFileListLine, RiArrowRightLine, RiTruckLine, RiRecycleLine, RiMoneyDollarCircleLine } from '@remixicon/react';
import Link from 'next/link';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

interface QuickAccessCard {
     title: string;
     description: string;
     link: string;
     icon: React.ReactNode;
     color: string;
}

interface InventoryModule {
     title: string;
     description: string;
     link: string;
     icon: React.ReactNode;
     color: string;
     features: string[];
}

const quickAccessCards: QuickAccessCard[] = [
     {
          title: "Inventory Items",
          description: "Manage products and stock levels",
          link: "/inventory/items",
          icon: <RiBox3Line size={32} />,
          color: "#2563eb"
     },
     {
          title: "Purchase Orders",
          description: "Create and track supplier orders",
          link: "/inventory/orders",
          icon: <RiShoppingCartLine size={32} />,
          color: "#16a34a"
     },
     {
          title: "Suppliers",
          description: "Manage supplier information",
          link: "/inventory/suppliers",
          icon: <RiTruckLine size={32} />,
          color: "#ea580c"
     },
     {
          title: "Stock Templates",
          description: "Create reusable item templates",
          link: "/inventory/templates",
          icon: <RiFileListLine size={32} />,
          color: "#8b5cf6"
     }
];

const inventoryModules: InventoryModule[] = [
     {
          title: "Analytics & Reporting",
          description: "Comprehensive inventory analytics and insights",
          link: "/inventory/analytics",
          icon: <RiBarChartLine size={32} />,
          color: "#06b6d4",
          features: ["Stock trends", "Value analysis", "Performance metrics", "Custom reports"]
     },
     {
          title: "Consumption Tracking",
          description: "Monitor item usage and consumption patterns",
          link: "/inventory/consumption",
          icon: <RiRecycleLine size={32} />,
          color: "#84cc16",
          features: ["Usage history", "Consumption rates", "Cost tracking", "Waste analysis"]
     },
     {
          title: "Expired Products",
          description: "Track and manage expired inventory items",
          link: "/inventory/expired-products",
          icon: <RiCloseLine size={32} />,
          color: "#dc2626",
          features: ["Expiry alerts", "Batch tracking", "Disposal records", "Compliance reporting"]
     },
     {
          title: "Stock Locations",
          description: "Organize inventory by storage locations",
          link: "/inventory/locations",
          icon: <RiStoreLine size={32} />,
          color: "#f59e0b",
          features: ["Location mapping", "Capacity management", "Transfer tracking", "Space optimization"]
     },
     {
          title: "Stock Wastage",
          description: "Track and analyze inventory wastage",
          link: "/inventory/wastage",
          icon: <RiDeleteBinLine size={32} />,
          color: "#ef4444",
          features: ["Wastage reports", "Cost analysis", "Prevention strategies", "Trend analysis"]
     },
     {
          title: "Payment Management",
          description: "Handle supplier payments and transactions",
          link: "/inventory/payments",
          icon: <RiMoneyDollarCircleLine size={32} />,
          color: "#10b981",
          features: ["Payment tracking", "Invoice management", "Due dates", "Payment history"]
     },
     {
          title: "Categories",
          description: "Organize items by categories",
          link: "/inventory/categories",
          icon: <RiPriceTagLine size={32} />,
          color: "#8b5cf6",
          features: ["Category hierarchy", "Item grouping", "Custom categories", "Bulk operations"]
     },
     {
          title: "Units & Conversion",
          description: "Manage measurement units and conversions",
          link: "/inventory/units",
          icon: <RiArrowRightLine size={32} />,
          color: "#6366f1",
          features: ["Unit definitions", "Conversion rates", "Bulk conversions", "Standard units"]
     }
];

export default function InventoryPage() {
     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiStoreLine className="me-2" />
                              Inventory Management
                         </h2>
                         <p className="text-muted mb-0">Manage laboratory supplies, equipment, and consumables</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Link href="/inventory/analytics" className="btn btn-outline-success btn-sm">
                              <RiBarChartLine className="me-1" />
                              View Analytics
                         </Link>
                    </div>
               </div>

               {/* Overview Content */}
               <div>

                    {/* Quick Access Cards */}
                    <div className="mb-4">
                         <h5 className="mb-3 fw-semibold">Core Modules</h5>
                         <div className="row g-3">
                              {quickAccessCards.map((card, index) => (
                                   <div key={index} className="col-md-6 col-lg-3">
                                        <Link href={card.link} className="text-decoration-none">
                                             <div
                                                  className="border rounded p-4 h-100 position-relative overflow-hidden"
                                                  style={{
                                                       backgroundColor: 'var(--bs-body-bg)',
                                                       transition: 'all 0.2s',
                                                       cursor: 'pointer'
                                                  }}
                                                  onMouseEnter={(e) => {
                                                       e.currentTarget.style.borderColor = card.color;
                                                       e.currentTarget.style.transform = 'translateY(-2px)';
                                                       e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                  }}
                                                  onMouseLeave={(e) => {
                                                       e.currentTarget.style.borderColor = COLOR_BORDER;
                                                       e.currentTarget.style.transform = 'translateY(0)';
                                                       e.currentTarget.style.boxShadow = 'none';
                                                  }}
                                             >
                                                  <div className="mb-3" style={{ color: card.color }}>
                                                       {card.icon}
                                                  </div>
                                                  <h6 className="fw-bold mb-2 text-body-emphasis">{card.title}</h6>
                                                  <p className="small text-muted mb-2">{card.description}</p>
                                                  <div className="d-flex align-items-center small mt-2" style={{ color: card.color }}>
                                                       <span className="me-1">Access</span>
                                                       <RiArrowRightLine size={16} />
                                                  </div>
                                             </div>
                                        </Link>
                                   </div>
                              ))}
                         </div>
                    </div>

                    {/* Inventory Modules Overview */}
                    <div className="mb-4">
                         <h5 className="mb-3 fw-semibold">Advanced Features</h5>
                         <div className="row g-3">
                              {inventoryModules.map((module, index) => (
                                   <div key={index} className="col-md-6 col-lg-3">
                                        <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                             <div className="d-flex align-items-center mb-3">
                                                  <div style={{ color: module.color }}>
                                                       {module.icon}
                                                  </div>
                                                  <div className="ms-3">
                                                       <h6 className="fw-bold mb-1">{module.title}</h6>
                                                       <p className="small text-muted mb-0">{module.description}</p>
                                                  </div>
                                             </div>
                                             <div className="mb-3">
                                                  {module.features.slice(0, 2).map((feature, idx) => (
                                                       <div key={idx} className="small text-muted mb-1">
                                                            • {feature}
                                                       </div>
                                                  ))}
                                             </div>
                                             <Link href={module.link} className="btn btn-sm w-100" style={{ backgroundColor: module.color, borderColor: module.color }}>
                                                  Explore Module
                                             </Link>
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </div>

                    {/* Getting Started */}
                    <div className="row g-4">
                         <div className="col-12">
                              <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-3 fw-semibold">Getting Started</h5>
                                   <div className="row g-3">
                                        <div className="col-md-4">
                                             <div className="d-flex align-items-start">
                                                  <div className="me-3 mt-1">
                                                       <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                            1
                                                       </div>
                                                  </div>
                                                  <div>
                                                       <h6 className="mb-1">Set Up Your Inventory</h6>
                                                       <p className="small text-muted mb-2">Add categories, suppliers, and initial stock items</p>
                                                       <Link href="/inventory/items" className="small">
                                                            Add Items →
                                                       </Link>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="col-md-4">
                                             <div className="d-flex align-items-start">
                                                  <div className="me-3 mt-1">
                                                       <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                            2
                                                       </div>
                                                  </div>
                                                  <div>
                                                       <h6 className="mb-1">Configure Suppliers</h6>
                                                       <p className="small text-muted mb-2">Set up vendor information and contact details</p>
                                                       <Link href="/inventory/suppliers" className="small">
                                                            Add Suppliers →
                                                       </Link>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="col-md-4">
                                             <div className="d-flex align-items-start">
                                                  <div className="me-3 mt-1">
                                                       <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                            3
                                                       </div>
                                                  </div>
                                                  <div>
                                                       <h6 className="mb-1">Create Purchase Orders</h6>
                                                       <p className="small text-muted mb-2">Start ordering items to maintain stock levels</p>
                                                       <Link href="/inventory/orders" className="small">
                                                            Create Orders →
                                                       </Link>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="row g-4 mt-2">
                         <div className="col-12">
                              <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-3 fw-semibold">Quick Actions</h5>
                                   <div className="row g-2">
                                        <div className="col-md-3">
                                             <Link href="/inventory/orders" className="btn btn-outline-primary w-100">
                                                  <RiAddLine className="me-1" />
                                                  New Order
                                             </Link>
                                        </div>
                                        <div className="col-md-3">
                                             <Link href="/inventory/items" className="btn btn-outline-success w-100">
                                                  <RiBox3Line className="me-1" />
                                                  Add Item
                                             </Link>
                                        </div>
                                        <div className="col-md-3">
                                             <Link href="/inventory/analytics" className="btn btn-outline-info w-100">
                                                  <RiBarChartLine className="me-1" />
                                                  View Reports
                                             </Link>
                                        </div>
                                        <div className="col-md-3">
                                             <Link href="/inventory/wastage" className="btn btn-outline-warning w-100">
                                                  <RiAlertLine className="me-1" />
                                                  Check Alerts
                                             </Link>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}