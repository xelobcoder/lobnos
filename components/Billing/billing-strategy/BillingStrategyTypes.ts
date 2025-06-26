export type PriceType = 'percentage' | 'flat';
export type EntityType = 'organization' | 'insurance' | 'clinician' | 'general';
export type ConditionType = 'time_of_day' | 'day_of_week' | 'custom' | 'date_time_range';
export type Comparator = 'equals' | 'greater_than' | 'less_than';

export interface BillingStrategy {
    id?: number;
    name: string;
    description?: string;
    is_discount?: number;
    applies_to_all_tests?: number;
    apply_time_based?: number;
    priority?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface BillingStrategyAssignment {
    id?: number;
    billing_strategy_id: number;
    entity_type: EntityType;
    track_id?: number;
    applies_from: Date;
    applies_to?: Date;
}

export interface BillingStrategyPrice {
    idRPGpt: number;
    billing_strategy_id: number;
    test_panel_id?: number;
    price_type: PriceType;
    amount: number;
}

export interface BillingStrategyCondition {
    id?: number;
    billing_strategy_id: number;
    condition_type: ConditionType;
    condition_value?: string;
    comparator?: Comparator;
    start_datetime?: Date | null;
    end_datetime?: Date | null;
    start_time?: string;
    end_time?: string;
    timezone?: string;
}

export interface BillingPromoCode {
    id?: number;
    code: string;
    description?: string;
    campaign_id?: number;
    discount_type: PriceType;
    discount_value: number;
    max_uses?: number;
    times_used?: number;
    is_active?: boolean;
    valid_from: Date;
    valid_to?: Date;
    created_at?: Date;
    updated_at?: Date;
}

export interface BillingCampaign {
    id?: number;
    name: string;
    description?: string;
    start_date: Date;
    end_date?: Date;
    created_at?: Date;
    updated_at?: Date;
}

export interface TestPanel {
    prim_key?: number;
    name: string;
    description?: string;
    base_price?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface BillingAudit {
    id?: number;
    entity_type: EntityType;
    track_id?: number;
    test_panel_id: number;
    base_price: number;
    final_price: number;
    strategy_id?: number;
    price_id?: number;
    promo_code_id?: number;
    conditions_applied?: number[];
    calculated_at: Date;
}