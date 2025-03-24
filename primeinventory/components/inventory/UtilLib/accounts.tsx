interface InventoryAccount {
    id: string;
    name: string;
    type: 'asset' | 'liability' | 'expense' | 'revenue';
    balance: number;
}

interface PurchaseAccount {
    id: string;
    name: string;
    type: 'expense' | 'asset';
    balance: number;
}

interface SalesRevenueAccount {
    id: string;
    name: string;
    type: 'revenue';
    balance: number;
}

interface AccountsPayable {
    id: string;
    name: string;
    type: 'liability';
    balance: number;
}

interface AccountsReceivable {
    id: string;
    name: string;
    type: 'asset';
    balance: number;
}

interface InventoryAdjustmentAccount {
    id: string;
    name: string;
    type: 'expense';
    balance: number;
}

interface InventoryWriteOffAccount {
    id: string;
    name: string;
    type: 'expense';
    balance: number;
}

interface ReturnsAndAllowancesAccount {
    id: string;
    name: string;
    type: 'revenue';
    balance: number;
}

interface ShippingExpenseAccount {
    id: string;
    name: string;
    type: 'expense';
    balance: number;
}

interface TaxAccount {
    id: string;
    name: string;
    type: 'liability';
    balance: number;
}

interface ObsoleteInventoryAccount {
    id: string;
    name: string;
    type: 'asset' | 'expense';
    balance: number;
}

interface InventorySystem {
    inventoryAccount: InventoryAccount;
    purchaseAccount: PurchaseAccount;
    salesRevenueAccount: SalesRevenueAccount;
    accountsPayable: AccountsPayable;
    accountsReceivable: AccountsReceivable;
    inventoryAdjustmentAccount: InventoryAdjustmentAccount;
    inventoryWriteOffAccount: InventoryWriteOffAccount;
    returnsAndAllowancesAccount: ReturnsAndAllowancesAccount;
    shippingExpenseAccount: ShippingExpenseAccount;
    taxAccount: TaxAccount;
    obsoleteInventoryAccount: ObsoleteInventoryAccount;
}
