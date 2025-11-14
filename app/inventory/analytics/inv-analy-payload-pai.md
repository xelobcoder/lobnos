# Inventory Analytics API Documentation

## Overview

The Inventory Analytics API provides comprehensive business intelligence capabilities for inventory management. It offers 12 different analytics endpoints covering stock levels, procurement, costs, usage patterns, and predictive analytics.

## Authentication & Tenant Handling

All analytics endpoints require tenant identification via query parameter:

```javascript
// Required query parameter for all requests
?tenantId=123
```

**Example:**
```javascript
const response = await fetch('/api/analytics/dashboard?tenantId=123');
```

## API Endpoints

### 1. Dashboard Summary
**Endpoint:** `GET /analytics/dashboard`  
**Purpose:** High-level overview of inventory status

**Response Structure:**
```typescript
interface InventoryAnalyticsSummary {
  total_items: number;
  active_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_stock_value: number;
  total_categories: number;
  total_suppliers: number;
  total_locations: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Inventory dashboard summary retrieved successfully",
  "data": {
    "total_items": 1250,
    "active_items": 1180,
    "low_stock_items": 45,
    "out_of_stock_items": 12,
    "total_stock_value": 250000.00,
    "total_categories": 25,
    "total_suppliers": 15,
    "total_locations": 8
  }
}
```

### 2. Stock Status Analytics
**Endpoint:** `GET /analytics/stock-status`  
**Purpose:** Current stock distribution by status

**Response Structure:**
```typescript
interface StockStatusAnalytics {
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  expired: number;
  stock_value_by_status: {
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    expired: number;
  };
}
```

### 3. Purchase Order Analytics
**Endpoint:** `GET /analytics/purchase-orders`  
**Purpose:** Purchase order performance and trends

**Response Structure:**
```typescript
interface PurchaseOrderAnalytics {
  total_orders: number;
  pending_orders: number;
  received_orders: number;
  cancelled_orders: number;
  total_order_value: number;
  average_order_value: number;
  orders_by_month: Array<{
    month: string;
    count: number;
    value: number;
  }>;
  top_suppliers: Array<{
    supplier_id: string;
    supplier_name: string;
    order_count: number;
    total_value: number;
  }>;
}
```

### 4. Transaction Analytics
**Endpoint:** `GET /analytics/transactions`  
**Purpose:** Inventory transaction patterns and trends

**Query Parameters:**
- `itemid` (optional): Filter by specific item
- `supplierid` (optional): Filter by supplier
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)

**Response Structure:**
```typescript
interface TransactionAnalytics {
  total_transactions: number;
  additions: number;
  consumptions: number;
  adjustments: number;
  transfers: number;
  wastage: number;
  transaction_trends: Array<{
    date: string;
    additions: number;
    consumptions: number;
    adjustments: number;
  }>;
  top_consumed_items: Array<{
    item_id: string;
    item_name: string;
    total_consumed: number;
  }>;
}
```

### 5. Payment Analytics
**Endpoint:** `GET /analytics/payments`  
**Purpose:** Supplier payment tracking and analysis

**Response Structure:**
```typescript
interface PaymentAnalytics {
  total_payments: number;
  pending_payments: number;
  completed_payments: number;
  failed_payments: number;
  total_payment_value: number;
  average_payment_value: number;
  payments_by_method: Record<string, number>;
  supplier_payment_summary: Array<{
    supplier_id: string;
    supplier_name: string;
    total_paid: number;
    pending_amount: number;
    payment_count: number;
  }>;
}
```

### 6. Cost Analytics
**Endpoint:** `GET /analytics/costs`  
**Purpose:** Inventory cost analysis by category and trends

**Response Structure:**
```typescript
interface CostAnalytics {
  total_inventory_value: number;
  average_item_cost: number;
  cost_by_category: Array<{
    category_id: string;
    category_name: string;
    total_value: number;
    item_count: number;
  }>;
  monthly_cost_trends: Array<{
    month: string;
    additions_cost: number;
    consumption_cost: number;
  }>;
}
```

### 7. Supplier Analytics
**Endpoint:** `GET /analytics/suppliers`  
**Purpose:** Supplier performance metrics

**Response Structure:**
```typescript
interface SupplierAnalytics {
  total_suppliers: number;
  active_suppliers: number;
  supplier_performance: Array<{
    supplier_id: string;
    supplier_name: string;
    total_orders: number;
    total_value: number;
    on_time_delivery_rate: number;
    average_delivery_days: number;
    payment_terms: string;
  }>;
}
```

### 8. Stock Level Analytics
**Endpoint:** `GET /analytics/stock-levels`  
**Purpose:** Detailed stock level monitoring with alerts and predictions

**Response Structure:**
```typescript
interface StockLevelAnalytics {
  current_stock_on_hand: number;
  stock_available_for_use: number;
  stock_on_order: number;
  allocated_stock: number;
  stock_threshold_alerts: Array<{
    item_id: string;
    item_name: string;
    current_stock: number;
    min_stock: number;
    max_stock: number;
    status: string;
    alert_type: 'low_stock' | 'over_stock' | 'out_of_stock';
  }>;
  days_of_inventory_remaining: Array<{
    item_id: string;
    item_name: string;
    current_stock: number;
    daily_consumption_rate: number;
    days_remaining: number;
    status: 'critical' | 'warning' | 'normal';
  }>;
  predictive_analytics: {
    stock_out_predictions: Array<{
      item_id: string;
      item_name: string;
      predicted_stock_out_date: string;
      days_until_stock_out: number;
    }>;
    overstock_predictions: Array<{
      item_id: string;
      item_name: string;
      excess_quantity: number;
      carrying_cost_impact: number;
    }>;
    safety_stock_recommendations: Array<{
      item_id: string;
      item_name: string;
      current_safety_stock: number;
      recommended_safety_stock: number;
      reasoning: string;
    }>;
  };
}
```

### 9. Inventory Movement Analytics
**Endpoint:** `GET /analytics/movement`  
**Purpose:** Track inventory movement patterns and velocity

**Response Structure:**
```typescript
interface InventoryMovementAnalytics {
  movement_by_type: {
    total_received: number;
    total_issued: number;
    total_returned: number;
    internal_transfers_in: number;
    internal_transfers_out: number;
    write_offs: number;
    expired_quantity: number;
    wastage_quantity: number;
  };
  velocity_metrics: {
    item_turnover_rate: Array<{
      item_id: string;
      item_name: string;
      turnover_ratio: number;
      turnover_category: 'fast' | 'medium' | 'slow';
    }>;
    average_inventory_age: Array<{
      item_id: string;
      item_name: string;
      average_days_in_stock: number;
      last_movement_date: string;
    }>;
    fast_moving_items: Array<{
      item_id: string;
      item_name: string;
      monthly_movement: number;
      ranking: number;
    }>;
    slow_moving_items: Array<{
      item_id: string;
      item_name: string;
      days_since_last_movement: number;
      total_stock_value: number;
    }>;
  };
  movement_trends: Array<{
    month: string;
    received: number;
    issued: number;
    transfers: number;
    adjustments: number;
    net_movement: number;
  }>;
}
```

### 10. Batch Expiry Analytics
**Endpoint:** `GET /analytics/batch-expiry`  
**Purpose:** Monitor batch expiry dates and utilization

**Response Structure:**
```typescript
interface BatchExpiryAnalytics {
  items_by_batch: Array<{
    batch_number: string;
    item_id: string;
    item_name: string;
    total_received: number;
    total_consumed: number;
    remaining_quantity: number;
    expiry_date: string;
    days_until_expiry: number;
    status: 'fresh' | 'near_expiry' | 'expired';
  }>;
  expiry_summary: {
    expired_stock_value: number;
    near_expiry_7_days: number;
    near_expiry_30_days: number;
    near_expiry_60_days: number;
    expired_items_count: number;
  };
  batch_quality_issues: Array<{
    batch_number: string;
    item_name: string;
    issue_type: 'qc_failure' | 'quarantined' | 'recall';
    quantity_affected: number;
    reported_date: string;
    status: string;
  }>;
  supplier_batch_performance: Array<{
    supplier_id: string;
    supplier_name: string;
    total_batches: number;
    expired_batches: number;
    expiry_rate: number;
    average_batch_lifespan_days: number;
  }>;
}
```

### 11. Procurement Analytics
**Endpoint:** `GET /analytics/procurement`  
**Purpose:** Comprehensive procurement performance analysis

**Response Structure:**
```typescript
interface ProcurementAnalytics {
  supplier_performance: Array<{
    supplier_id: string;
    supplier_name: string;
    lead_time_days: number;
    on_time_delivery_rate: number;
    delivery_discrepancy_rate: number;
    defect_rate: number;
    reliability_score: number;
    total_orders: number;
    total_order_value: number;
  }>;
  pricing_analytics: {
    price_history: Array<{
      item_id: string;
      item_name: string;
      supplier_id: string;
      supplier_name: string;
      purchase_date: string;
      unit_price: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    average_cost_per_supplier: Array<{
      supplier_id: string;
      supplier_name: string;
      average_unit_cost: number;
      last_purchase_price: number;
      standard_cost_variance: number;
    }>;
    best_suppliers: Array<{
      supplier_id: string;
      supplier_name: string;
      cost_score: number;
      quality_score: number;
      overall_score: number;
      ranking: number;
    }>;
  };
  procurement_efficiency: {
    average_po_processing_time_days: number;
    average_payment_cycle_days: number;
    emergency_purchases_count: number;
    emergency_purchase_percentage: number;
    order_accuracy_rate: number;
    supplier_response_time_avg: number;
  };
}
```

### 12. Cost Valuation Analytics
**Endpoint:** `GET /analytics/cost-valuation`  
**Purpose:** Inventory valuation using different costing methods

**Response Structure:**
```typescript
interface CostValuationAnalytics {
  current_valuation: {
    total_stock_value_fifo: number;
    total_stock_value_lifo: number;
    total_stock_value_weighted_avg: number;
    slow_moving_value: number;
    expired_stock_value: number;
    near_expiry_value: number;
  };
  cost_trends: Array<{
    month: string;
    additions_cost: number;
    consumption_cost: number;
    write_off_cost: number;
    net_cost_change: number;
  }>;
  profitability_impact: {
    cost_of_goods_issued: number;
    average_cost_per_unit: number;
    cost_variance_analysis: Array<{
      item_id: string;
      item_name: string;
      standard_cost: number;
      actual_cost: number;
      variance_percentage: number;
      variance_type: 'favorable' | 'unfavorable';
    }>;
    procurement_savings: Array<{
      period: string;
      baseline_cost: number;
      actual_cost: number;
      savings_amount: number;
      savings_percentage: number;
    }>;
  };
}
```

### 13. Usage Analytics
**Endpoint:** `GET /analytics/usage`  
**Purpose:** Department-wise usage patterns and anomaly detection

**Response Structure:**
```typescript
interface UsageAnalytics {
  consumption_patterns: {
    department_usage: Array<{
      department_id: string;
      department_name: string;
      total_consumed: number;
      percentage_of_total: number;
      top_items: Array<{
        item_id: string;
        item_name: string;
        quantity_consumed: number;
      }>;
    }>;
    consumption_trends: Array<{
      date: string;
      total_consumed: number;
      unique_items_used: number;
      consumption_value: number;
    }>;
    predictive_usage: Array<{
      item_id: string;
      item_name: string;
      predicted_monthly_usage: number;
      confidence_level: number;
      based_on_history_months: number;
    }>;
  };
  anomalies_red_flags: {
    unusual_usage_spikes: Array<{
      item_id: string;
      item_name: string;
      date: string;
      actual_usage: number;
      expected_usage: number;
      deviation_percentage: number;
      potential_cause: string;
    }>;
    potential_theft_indicators: Array<{
      item_id: string;
      item_name: string;
      unusual_pattern: string;
      risk_level: 'low' | 'medium' | 'high';
      last_incident_date: string;
    }>;
    misallocation_trends: Array<{
      item_id: string;
      item_name: string;
      allocated_quantity: number;
      actual_usage: number;
      variance_percentage: number;
      department: string;
    }>;
  };
  usage_efficiency: {
    stock_utilization_rate: number;
    average_usage_per_department: number;
    wastage_rate: number;
    optimal_ordering_patterns: Array<{
      item_id: string;
      item_name: string;
      recommended_order_quantity: number;
      recommended_order_frequency_days: number;
      reasoning: string;
    }>;
  };
}
```

## Error Handling

All endpoints return standardized error responses:

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  data: null;
}
```

**Common Error Scenarios:**
- **400 Bad Request**: Missing or invalid tenantId parameter
- **500 Internal Server Error**: Database connection issues or unexpected errors

**Example Error Response:**
```json
{
  "success": false,
  "message": "Tenant ID is required",
  "data": null
}
```

## Frontend Integration Examples

### React Hook Example
```typescript
import { useState, useEffect } from 'react';

interface AnalyticsData {
  // Define based on specific endpoint
  [key: string]: any;
}

const useAnalytics = (endpoint: string, tenantId: number) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics/${endpoint}?tenantId=${tenantId}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [endpoint, tenantId]);

  return { data, loading, error };
};

// Usage
const Dashboard = () => {
  const { data, loading, error } = useAnalytics('dashboard', 123);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Inventory Summary</h2>
      <p>Total Items: {data?.total_items}</p>
      <p>Active Items: {data?.active_items}</p>
    </div>
  );
};
```

### Axios Service Example
```typescript
import axios from 'axios';

class AnalyticsService {
  private baseUrl = '/api/analytics';

  async getDashboardSummary(tenantId: number) {
    const response = await axios.get(`${this.baseUrl}/dashboard`, {
      params: { tenantId }
    });
    return response.data;
  }

  async getStockStatus(tenantId: number) {
    const response = await axios.get(`${this.baseUrl}/stock-status`, {
      params: { tenantId }
    });
    return response.data;
  }

  async getTransactionAnalytics(tenantId: number, filters?: {
    itemid?: string;
    supplierid?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const response = await axios.get(`${this.baseUrl}/transactions`, {
      params: { tenantId, ...filters }
    });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
```

## Data Refresh Recommendations

- **Dashboard Summary**: Refresh every 5-15 minutes
- **Stock Status**: Refresh every 1-5 minutes (critical alerts)
- **Transaction Analytics**: Refresh every 30 minutes to hourly
- **Movement Analytics**: Refresh daily
- **Predictive Analytics**: Refresh daily or weekly

## Performance Considerations

- All endpoints include appropriate database indexing
- Large datasets are limited (typically 50 items max per array)
- Consider implementing client-side caching for frequently accessed data
- Use pagination for endpoints that might return large datasets

## Support

For questions about specific analytics calculations or data structures, refer to the backend controller implementations or contact the development team.</content>
<parameter name="filePath">c:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos-server\src\controllers\inventory\routes\inv-analy-payload-pai.md
