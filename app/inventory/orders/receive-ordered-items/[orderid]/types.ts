interface InventoryItem {
     id: string;
     name: string;
     category: string;
     brand?: string;
     supplier: string;
     sku: string;
     description: string;
     unit: string;
     batches: any[];
     currentStock: number;
     minStock: number;
     maxStock: number;
     unitPrice: number;
     previousSalePrice: number;
     previousWholesalePrice: number;
     salePrice: number;
     wholesalePrice: number;
     priceAdjustmentType: 'percentage' | 'fixed';
     priceAdjustmentValue: number;
     discountRate: number;
     taxRate: number;
     totalValue: number;
     location: string;
     expiryDate?: string;
     lastUpdated: string;
     status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface ReceivedItem {
     id: string;
     itemId: string;
     itemName: string;
     brand?: string;
     selectedBrand?: string;
     sku: string;
     orderedQuantity: number;
     quantityReceived: number; // Already received quantity
     receivedQuantity: number; // Quantity being received now
     remainingQuantity: number; // Remaining to receive
     unitPrice: number;
     discountRate: number;
     taxRate: number;
     batchNumber: string;
     expiryDate: string;
     unit: string;
     consumptionUnit?: string;
     selectedUnit?: { id: number; name: string } | null;
     unitsPerPurchaseUnit?: number;
     preferredPurchaseUnit?: number;
     totalValue: number;
     availableBrands?: string[];
     availableUnits?: { id: number; name: string }[];
     status: string; // Item status (ordered, partially_received, received)
}

interface PurchaseOrder {
     id: string;
     orderNumber: string;
     supplierId: string;
     supplierName: string;
     supplierEmail: string;
     supplierContact: string;
     supplierPhone?: string;
     supplierAddress?: string;
     items: any[];
     status: string;
     orderDate: string;
     expectedDeliveryDate?: string;
     actualDeliveryDate?: string;
     totalAmount: number;
     taxAmount: number;
     discountAmount: number;
     shippingCost: number;
     finalAmount: number;
     currency: string;
     paymentTerms?: string;
     notes?: string;
     createdBy?: string;
     approvedBy?: string;
     approvedAt?: string;
     sentAt?: string;
     communicationMethod?: string;
     communicationNotes?: string;
     createdAt: string;
     updatedAt?: string;
     itemsCount?: number;
     receivedItemsCount?: number;
}

export type { InventoryItem, ReceivedItem, PurchaseOrder };